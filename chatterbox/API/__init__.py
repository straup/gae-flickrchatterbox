from APIApp import APIApp
import chatterbox

class Dispatch (chatterbox.Request, APIApp) :
    
    def __init__ (self):
        chatterbox.Request.__init__(self)
        APIApp.__init__(self)

    def post (self) :
  
        if not self.check_logged_in(self.min_perms) :
            self.api_error(403)
            return

        method = self.request.get('method')
        format = self.request.get('format')

        if format and not format in self.valid_formats :
            self.api_error(999, 'Not a valid format')
            return

        if format :
            self.format = format

        if method == 'get_comments' :
            return self.get_comments()

    def ensure_crumb (self, path) :

        if not self.validate_crumb(self.user, path, self.request.get('crumb')) :
            self.api_error(400, 'Invalid crumb')
            return False

        return True

    def get_comments (self) :

        required = ('crumb', 'photo_id', 'min_comment_date')
        
        if not self.ensure_args(required) :
            return 

        if not self.ensure_crumb('method=search') :
            return

        method = 'flickr.photos.comments.getList'
        
        args = {
            'auth_token' : self.user.token,
            'photo_id' : self.request.get('photo_id'),
            'min_comment_date' : self.request.get('min_comment_date'),
            }

        rsp = self.api_call(method, args)
        
        if not rsp :
            return self.api_error()

        if rsp['stat'] != 'ok' :
            return self.api_error()

        return self.api_ok({'comments' : rsp['comments']})        

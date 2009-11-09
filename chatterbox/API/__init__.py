from APIApp import APIApp
import chatterbox
import time
import md5

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

        if method == 'get_contacts' :
            return self.api_get_contacts()

        if method == 'get_comments' :
            return self.api_get_comments()

    def ensure_crumb (self, path) :

        if not self.validate_crumb(self.user, path, self.request.get('crumb')) :
            self.api_error(400, 'Invalid crumb')
            return False

        return True

    def api_get_contacts (self) :

        required = ('crumb',)

        if not self.ensure_args(required) :
            return 

        if not self.ensure_crumb('method=contacts') :
            return

        refresh = 1800
        now = int(time.time())
        
        dt = now - refresh

        contacts = []
        
        try :
            contacts = self.get_contacts(dt)
            
        except Exception, e :

            self.api_error(999, 'Failed to get any comments: %s' % e)
            return            

        rsp = { 'contacts' : contacts, 'count_contacts' : len(contacts) }
        return self.api_ok(rsp)
    
    def api_get_comments (self) :

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

    def get_contacts (self, dt) :

        method = 'flickr.photos.comments.getRecentForContacts'
        
        api_args = {
            'auth_token' : self.user.token,
            'date_lastcomment' : dt,
            'extras' : 'owner_name',
            }
        
        photos = {}
        
        owners = []
        comments = []
        
        try :
            rsp = self.api_call(method, api_args)
        except Exception, e :
            raise Exception(e)
        
        if not rsp :
            raise Exception(e)
        
        if not rsp['stat'] == 'ok' :
            raise Exception(rsp['message'])      

        for ph in rsp['photos']['photo'] :
            
            nsid = ph['owner']
            
            if not nsid in owners :
                owners.append(nsid)
                
            if not photos.has_key(nsid) :
                icon = self.flickr_get_buddyicon(nsid)
                
                hex = md5.new(nsid).hexdigest()
                short_hex = hex[0:6]
                
                owner = {
                    'username' : ph['ownername'],
                    'nsid' : nsid,
                    'nsid_hex' : hex,
                    'nsid_short_hex' : short_hex,
                    'buddyicon' : icon,
                    'photos' : [],
                    'count' : 0,
                    }
                
                photos[nsid] = owner
                
            photos[nsid]['photos'].append(ph)
            photos[nsid]['count'] += 1

        for nsid in owners :
            comments.append(photos[nsid])
      
        return comments

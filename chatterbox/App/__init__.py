import chatterbox

import time
import logging
import md5

class Main (chatterbox.Request) :

  def get (self):

    if not self.check_logged_in(self.min_perms) :
        self.display("main_logged_out.html")
        return

    refresh = 1800
    now = int(time.time())
    
    dt = now - refresh
      
    search_crumb = self.generate_crumb(self.user, 'method=search')
    self.assign('search_crumb', search_crumb)
    
    comments = self.get_comments(dt)    

    self.assign('min_comment_date', dt)
    self.assign('refresh', refresh)    

    self.assign('comments', comments)
    self.assign('count_comments', len(comments))

    self.display("main_logged_in.html")
    return

  def get_comments (self, dt) :

    method = 'flickr.photos.comments.getRecentForContacts'
    
    api_args = {
        'auth_token' : self.user.token,
        'date_lastcomment' : dt,
        'extras' : 'owner_name',
    }

    rsp = self.api_call(method, api_args)
    photos = {}

    owners = []
    comments = []
    
    if not rsp :
      return photos    

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

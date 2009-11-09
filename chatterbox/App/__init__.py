from config import config
import chatterbox

import time
import logging
import md5

class ChatterboxException (Exception) :
  def __init__(self, value):
    self.value = value
    
  def __str__(self):
    return repr(self.value)

class ChatterboxAPIException (ChatterboxException) :
  def __init__(self, value):
    self.value = value
  
class Main (chatterbox.Request) :

  def get (self):

    if not self.check_logged_in(self.min_perms) :
        self.display("main_logged_out.html")
        return

    refresh = 1800
    now = int(time.time())
    
    dt = now - refresh

    contacts_crumb = self.generate_crumb(self.user, 'method=contacts')      
    search_crumb = self.generate_crumb(self.user, 'method=search')
  
    self.assign('contacts_crumb', contacts_crumb)
    self.assign('search_crumb', search_crumb)

    self.assign('min_comment_date', dt)
    self.assign('refresh', refresh)    

    if config['chatterbox_deferred_loading'] :
      pass
    
    else :      
      try :
        comments = self.get_comments(dt)
      
        self.assign('comments', comments)
        self.assign('count_comments', len(comments))
      
      except ChatterboxAPIException, e :
        print e
      except Exception, e :
        print e
    
    self.display("main_logged_in.html")
    return

  # Assuming that this isn't removed completely (that is we always
  # do deferred loading) it should be made to play moar bettar with
  # its twin in API/__init__.py
  
  def get_comments (self, dt) :

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
      raise ChatterboxAPIException(e)

    if not rsp :
      raise ChatterboxAPIException(e)

    print "cccc"
    print rsp
    
    if not rsp['stat'] == 'ok' :
      raise ChatterboxAPIException(rsp['message'])      

    print "aaa"
    print rsp
    
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

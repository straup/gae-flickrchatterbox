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

    self.display("main_logged_in.html")
    return

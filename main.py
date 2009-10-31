#!/usr/bin/env python

import wsgiref.handlers
from google.appengine.ext import webapp

import chatterbox.App
import chatterbox.Auth
import chatterbox.API

if __name__ == '__main__':

  handlers = [
    ('/', chatterbox.App.Main),
    ('/signout', chatterbox.Auth.Signout),
    ('/signin', chatterbox.Auth.Signin),    
    ('/auth', chatterbox.Auth.TokenDance),
    ('/api', chatterbox.API.Dispatch),    
    ]

  application = webapp.WSGIApplication(handlers, debug=False)
  wsgiref.handlers.CGIHandler().run(application)

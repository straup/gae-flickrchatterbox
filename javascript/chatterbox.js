if (! info){
    var info = {};
}

if (! info.aaronland){
    info.aaronland = {};
}

if (! info.aaronland.chatterbox){
    info.aaronland.chatterbox = {};
}

info.aaronland.chatterbox.Photos = function(args){
    this.args = args;

    this.current_photo = null;
    this.shown = null;

    var api_args = {
        'host' : this.args['host'],
    };

    this.api = new info.aaronland.flickrapp.API(api_args);

    this.comments_cache = {};

};

// do the thing to inherit from info.aaronland.flickrapp.API here (see below) ...

info.aaronland.chatterbox.Photos.prototype.show_photos = function(nsid){

    if (this.shown){

        $("#desc_" + this.shown).show();
        $("#photos_" + this.shown).hide();

        if (this.shown == nsid){
            this.shown = null;
            return;
        }
    }

    $("#desc_" + nsid).hide();
    $("#photos_" + nsid).show();

    this.shown = nsid
    return;
};

info.aaronland.chatterbox.Photos.prototype.get_comments = function(photo_id, nsid_hex){

    if (this.comments_cache[ photo_id ]){
        this.display_comments(this.comments_cache[ photo_id ], nsid);
        return;
    }

    var _self = this;

    var doThisOnSuccess = function(rsp){

        _self.comments_cache[ photo_id ] = rsp;

        var html = '';

        var count = rsp['comments']['comment'].length;
    
        html += '<ul style="margin:0px;padding:0px;margin-bottom:20px;">';
        
        for (var i=0; i < count; i++){
        
            var c = rsp['comments']['comment'][i];
            
            html += '<li style="font-family:serif;font-size:1.2em;color:#000;list-style-type:none;line-height:24px;background-color:#fff;padding:10px;padding-left:20px;padding-right:20px;padding-top:none;">';
            
            html += '<div><q>' + c['_content'] + '</q></div>';
            html += '<div style="font-size:small;text-align:right;margin-right:25px;margin-top:5px;">&#8212; <a href="' + c['permalink'] + '">' + c['authorname'] + '</a></div>';
            html += '</li>';
        }
        
        html += '</ul>';

        $("#comments_" + photo_id).html(html);

        var comments_count = $("#comments_count_" + nsid_hex)[0];
        var subtotal = parseInt(comments_count.getAttribute('class'));

        var total = subtotal + count;
        comments_count.setAttribute('class', total);

        var comments_html = '<span style="color:#cc0099;"><span style="font-weight:700;">' + total + '</span> new comment';

        if (total > 1){
            comments_html += 's';
        }

        comments_html += '</span> for';

        $("#comments_count_" + nsid_hex).html(comments_html);
    };

    var doThisIfNot = function (rsp){

            var html = '';

            if ((rsp) && (rsp['stat'] == 'fail')){
                html += 'Hrm. The Flickr API returned an error: ';
                html += rsp['error']['message'];
            }

            else {
                html += 'Ack! API call to Flickr failed completely. That\'s not good.';
            }

            $("#comments_" + photo_id).html(html);
    };

    var args = {
        'photo_id' : photo_id,
        'min_comment_date' : this.args['min_comment_date'],
        'crumb' : this.args['search_crumb'],
        'format' : 'json',
    }

    this.api.api_call('get_comments', args, doThisOnSuccess, doThisIfNot);

    this.current_photo = photo_id;
};

info.aaronland.chatterbox.Photos.prototype.show_photos = function(nsid){

    if (this.shown){

        $("#desc_" + this.shown).show();
        $("#photos_" + this.shown).hide();

        if (this.shown == nsid){
            this.shown = null;
            return;
        }
    }

    $("#desc_" + nsid).hide();
    $("#photos_" + nsid).show();

    this.shown = nsid
    return;
};

info.aaronland.chatterbox.Photos.prototype.get_contacts = function(){

    var _self = this;

    var doThisOnSuccess = function(rsp){

        var count = rsp['contacts'].length;

        var html = '';
        
        html += '<div style="margin-left:10%;">';

        for (var i=0; i < count; i++){

            var contact = rsp['contacts'][i];
            var count_photos = contact['photos'].length;

            html += '<div id="user_' + contact['nsid_hex'] + '" class="photos_hex_">';
            html += '<div style="float:left;margin-right:40px;margin-bottom:10px;">';

            html += '<a href="#" onclick="window.chatterbox.show_photos(\'' + contact['nsid_hex'] + '\');return false;">';
            html += '<img id="buddy_' + contact['nsid_hex'] + '" src="' + contact['buddyicon'] + '" height="48" width="48" class="buddy_hex" style="border:3px solid #' + contact['nsid_short_hex'] + '" />';
            html += '</a>';
            html += '</div>';

            html += '<div id="desc_' + contact['nsid_hex'] + '" style="float:left;font-size:1.15em;margin-top:15px;">';
            html += '<span style="border-bottom:none;font-weight:700;">' + contact['username'] + '</span> has <span class="0" id="comments_count_' + contact['nsid_hex'] + '">comments on</span> <span style="font-weight:700;">' + contact['count'] + '</span> photo';

            if (count_photos > 1){
                html += 's';
            }

            html += '</div>';

            html += '<div id="photos_' + contact['nsid_hex'] + '" style="display:none;">';

            // thumbs

            if (count_photos > 1){

                html += '<div style="float:left;margin-right:10px;margin-bottom:10px;">';

                for (var j=0; j < count_photos; j++){

                    var ph = contact['photos'][j];

                    html += '<div style="float:left;margin-right:10px;margin-bottom:10px;">';
                    html += '<a href="#thumb_' + ph['id'] + '">';
                    html += '<img id="photo_' + ph['id'] + '" src="http://farm' + ph['farm'] + '.static.flickr.com/' + ph['server'] + '/' + ph['id'] + '_' + ph['secret'] + '_s.jpg" height="48" width="48"  style="border:3px solid #' + contact['nsid_short_hex'] + '" /></a>';
                    html += '</div>';
                }

                html += '</div>';
                html += '<br clear="all" />';

            }

            // the actual photos

            for (var j=0; j < count_photos; j++){

                var ph = contact['photos'][j];

                html += '<a name="thumb_' + ph['id'] + '"></a>';
                html += '<div style="margin-left:95px;">';
                html += '<div style="float:left;margin-right:10px;margin-bottom:10px;">';

                html += '<a href="http://www.flickr.com/photo.gne?id=' + ph['id'] + '" target="_flickr">';
                html += '<img id="photo_' + ph['id'] + '" src="http://farm' + ph['farm'] + '.static.flickr.com/' + ph['server'] + '/' + ph['id'] + '_' + ph['secret'] + '_m.jpg"  style="border:3px solid #' + contact['nsid_short_hex'] + '" /></a>';
                html += '</div>';

                html += '<div id="comments_' + ph['id'] + '" style="margin-left:275px;">loading...</div>';
                html += '</div>';

                html += '<br clear="all" /><br />';
      
            }

            html += '</div>';
            html += '</div>';

            html += '<br clear="all" />';            
        }

        html += '</div>';

        // the js for loading the comments

        html += '<script type="text/javascript">';

        for (var i=0; i < count; i++){

            var contact = rsp['contacts'][i];
            var count_photos = contact['photos'].length;

            for (var j=0; j < count_photos; j++){

                var delay = Math.floor(Math.random() * 1000);

                var id = contact['photos'][j]['id'];
                var hex = contact['nsid_hex'];
                
                html += 'setTimeout(function(){';
                html += 'window.chatterbox.get_comments(\'' + id + '\', \'' + hex + '\') }';
                html += ', ' + delay + ');';

                // console.log(contact['username'] + ': ' + id + ' / ' + count_photos);
            }
        }

        html += '</script>';

        $("#contacts").html(html);
    };

    var doThisIfNot = function (rsp){

        var html = '';

        html += '<div class="error">';
        html += 'Blargh! Something went wrong: <em>' + rsp['error']['message'] + '</em>';
        html += '</div>';
        html += '<span style="font-size:small;"><a href="/">Try again?</a></span>';

        $("#contacts").html(html);
    };

    var args = {
        'crumb' : this.args['contacts_crumb'],
        'format' : 'json',
    }

    this.api.api_call('get_contacts', args, doThisOnSuccess, doThisIfNot);
};
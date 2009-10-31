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
        'crumb' : this.args['crumb'],
        'format' : 'json',
    }

    this.api.api_call('get_comments', args, doThisOnSuccess, doThisIfNot);

    this.current_photo = photo_id;
};
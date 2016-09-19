siteList = [ [ '--', '' ] ];
siteList.push.apply( siteList, postFormInitData.sitelist.map(function( obj ) {
    return [ obj.sitename, obj.domain ]
}));

siteByDomain = new Object;
siteList.forEach(function(site) {
    siteByDomain[ site[1] ] = site[0];
});

userDlg = false;


CKEDITOR.dialog.add( 'dwuserDialog', function( editor ) {
    return {
        title: "User Properties",
        minWidth: 400,
        minHeight: 200,
        contents: [
            {
                id: 'tab-basic',
                label: 'Basic Settings',
                elements: [
                    {
                        type: 'text',
                        id: 'user',
                        label: 'Username',
                        validate: CKEDITOR.dialog.validate.notEmpty( "Username field cannot be empty." ),
                        setup: function( element ) {
                            this.setValue( element.getAttribute( 'name' ) );
                        },
                        commit: function( element ) {
                            var name = this.getValue();
                            if ( name ) {
                                element.setAttribute( 'name', name );
                            } else if ( !this.insertMode )
                                element.removeAttribute( 'name' );
                        },
                    },
                    {
                        type: 'select',
                        id: 'site',
                        label: 'External Site (optional)',
                        'default': '',
                        items: siteList,
                        setup: function( element ) {
                            if ( element.getAttribute( 'site' ) )
                                element.setValue( element.getAttribute( 'site ' ) );
                        },
                        commit: function( element ) {
                            var site = this.getValue();
                            if ( site && site !== '') {
                                element.setAttribute( 'site', site );
                            } else if ( ( site && site === '' ) || !this.insertMode ) {
                                element.removeAttribute( 'site' );
                            }
                        }
                    }
                ]
            }
        ],

        onShow: function() {
            var selection = editor.getSelection();
            var element = selection.getStartElement();
            if ( element ) {
                posselement = element.getAscendant( 'span', true ) ;
                if ( posselement && posselement.hasClass( 'ljuser' ) ) {
                    element = posselement;
                }
            }
            if ( !element || !element.hasClass( 'ljuser' ) ) {
                this.insertMode = true;

                element = editor.document.createElement( 'span' );
                element.setAttribute( 'name', '');
                element.addClass( 'ljuser' );

                img = editor.document.createElement( 'img' );
                img.setAttribute( 'src', window.parent.site_p.imgprefix + "/silk/identity/user.png");
                img.setAttribute( 'alt', "[personal profile ]" );
                element.append( img );
            } else {
                this.insertMode = false;
            }
            this.element = element;
            if ( !this.insertMode )
                this.setupContent( this.element );
        },

        onOk: function() {
            userDlg = this;
            user = userDlg.element;
            this.commitContent( user );
            if ( ! user.getAttribute( 'name' ) ) {
                return;
            }
            if ( ! user.getAttribute( 'site' ) ) {
                var strong = editor.document.createElement( 'strong' );
                strong.setText( user.getAttribute( 'name' ) );
                var link = editor.document.createElement( 'a' );
                link.setAttribute( 'href', window.parent.site_p.siteroot.replace( "www", user.getAttribute( 'name' ) ) );
                link.append( strong );
                user.append(link);
            } else {
                var postData = {
                    "username" : user.getAttribute( 'name' ) || '',
                    "site" : user.getAttribute( 'site' ) || ''
                };
                var url = window.parent.site_p.siteroot + "/tools/endpoints/ljuser";
                $.ajax({
                    type: "POST",
                    url: url,
                    data: postData,
                    dataType: "json",
                    contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
                    timeout: 20000,
                    success: function( data, textStatus, jqXHR ) {
                        if (data.error) {
                            alert(data.error);
                            return;
                        }
                        site = user.getAttribute( 'site' );
                        if ( site )
                            //data.ljuser = data.ljuser.replace(/<span.+?class=['"]?ljuser['"]?.+?>/,'<span class="ljuser" site="' + site + '">');
                            data.ljuser = data.ljuser.replace(/<span.+?class=['"]?ljuser['"]?.+?>/,'');
                        else
                            //data.ljuser.replace(/<span.+?class=['"]?ljuser['"]?.+?>/,'<span class="ljuser" site="' + site + '">');
                            data.ljuser.replace(/<span.+?class=['"]?ljuser['"]?.+?>/,'');
                        //data.ljuser = data.ljuser.replace(/<\/span>/,'</div>');
                        data.ljuser = data.ljuser.replace(/<\/span>/,'');
                        user.setHtml(data.ljuser + "&nbsp;");
                    },
                    error: function( jqXHR, textStatus, errorThrown ) {
                        alert( "error retrieving user embed code" );
                        console.log( textStatus );
                        console.log( errorThrown );
                    }
                });
            }
            // This prevents span recognition in the htmlparser...boo.
            //user.setAttribute( 'contenteditable', "false" );
            if ( this.insertMode )
                editor.insertElement( user );
        }
    };
});

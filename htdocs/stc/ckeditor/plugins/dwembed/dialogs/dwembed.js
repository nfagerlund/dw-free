CKEDITOR.dialog.add( 'dwembedDialog', function( editor ) {
    return {
        title: "Insert Embedded Content",
        minWidth: 400,
        minHeight: 200,
        contents: [
            {
                id: 'tab-basic',
                label: 'Basic Settings',
                rows: 5,
                cols: 80,
                elements: [
                    {
                        type: 'textarea',
                        id: 'dwembed',
                        label: 'Add media from other websites by copying and pasting their embed code here.',
                        'default': '',
                        validate: CKEDITOR.dialog.validate.notEmpty( "Embed text field cannot be empty." ),
                        setup: function( element ) {
                            this.setValue( element.getAttribute( 'text' ) );
                        },
                        commit: function( element ) {
                            var text = this.getValue();
                            if ( text ) 
                                element.setHtml( this.getValue() );
                            else if ( !this.insertMode )
                                element.setText( '' );
                        },
                    }
                ]
            }
        ],

        onShow: function() {
            var selection = editor.getSelection();
            var element = selection.getStartElement();
            if ( element ) {
                posselement = element.getAscendant( 'div', true ) ;
                if ( posselement && posselement.hasClass( 'ljembed' ) ) {
                    element = posselement;
                }
            }
            if ( !element || !element.hasClass( 'ljembed' ) ) {
                element = editor.document.createElement( 'div' );
                element.setText( "" );
                element.addClass( 'ljembed' );
                this.insertMode = true;
            } else {
                this.insertMode = false;
            }
            this.element = element;
            if ( !this.insertMode )
                this.setupContent( this.element );
        },

        onOk: function() {
            var dialog = this;
            var embed = this.element;
            this.commitContent( embed );
            if ( this.insertMode )
                editor.insertElement( embed );
        }
    };
});

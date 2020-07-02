CKEDITOR.plugins.add( 'dwuser', {
    icons: 'dwuser',

    init: function( editor ) {
        editor.addCommand( 'dwuser', new CKEDITOR.dialogCommand( 'dwuserDialog', {
            allowedContent: 'div[name,site](ljuser) img[!src,alt,width,height] a[!href] strong',
            requiredContent: 'div',
            contentForms: [
                'user'
            ]
        } ) );
        editor.ui.addButton( 'DWUser', {
            label: 'Insert Dreamwidth User',
            command: 'dwuser',
            toolbar: 'insert'
        } );
        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'dwGroup' );
            editor.addMenuItem( 'dwuserItem', {
                label: 'Edit User',
                icon: this.path + 'icons/dwuser.png',
                command: 'dwuser',
                group: 'dwGroup'
            } );

            editor.contextMenu.addListener( function( element ) {
                var parent = element.getAscendant( 'div', true );
                if ( parent.hasClass( 'ljuser' ) ) {
                    return { cutItem: CKEDITOR.TRISTATE_OFF };
                }
            } );
        }

        CKEDITOR.dialog.add( 'dwuserDialog', this.path + 'dialogs/dwuser.js' );
        editor.addContentsCss( this.path + 'styles/dwuser.css' );
    }
});

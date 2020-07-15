jQuery(function($){
    "use strict";
    $(document).on('click', '.js-comment-thread-focus-enable-trigger', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var focusControl = $(e.target).closest('.js-comment-thread-focus');
        var focusTarget = $('#' + focusControl.data('target'));
        var thread = focusControl.closest('.comment-thread');
        var toHide = thread.prevUntil(focusTarget);
        toHide.hide();
        focusControl.find('.js-comment-thread-focus-deactivate').show();
        $(e.target).closest('.js-comment-thread-focus-activate').hide();
    });

    $(document).on('click', '.js-comment-thread-focus-disable-trigger', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var focusControl = $(e.target).closest('.js-comment-thread-focus');
        var focusTarget = $('#' + focusControl.data('target'));
        var thread = focusControl.closest('.comment-thread');
        var toShow = thread.prevUntil(focusTarget);
        toShow.show();
        focusControl.find('.js-comment-thread-focus-activate').show();
        $(e.target).closest('.js-comment-thread-focus-deactivate').hide();
    });
});

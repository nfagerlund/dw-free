jQuery(function($){
    "use strict";
    $(document).on('click', '.threadfocus-hide-trigger', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var focusControl = $(e.target).closest('.threadfocus');
        var focusTarget = $('#' + focusControl.data('target'));
        var thread = focusControl.closest('.comment-thread');
        var toHide = thread.prevUntil(focusTarget);
        toHide.hide();
        focusControl.find('.threadfocus-siblings-hidden').show();
        $(e.target).closest('.threadfocus-siblings-visible').hide();
    });

    $(document).on('click', '.threadfocus-show-trigger', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var focusControl = $(e.target).closest('.threadfocus');
        var focusTarget = $('#' + focusControl.data('target'));
        var thread = focusControl.closest('.comment-thread');
        var toShow = thread.prevUntil(focusTarget);
        toShow.show();
        focusControl.find('.threadfocus-siblings-visible').show();
        $(e.target).closest('.threadfocus-siblings-hidden').hide();
    });
});

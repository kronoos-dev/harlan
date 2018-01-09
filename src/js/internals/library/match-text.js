export default function matchText(node, regex, callback, validate = null, excludeElements = ['script', 'style', 'iframe', 'canvas']) {

    let child = node.firstChild;
    while (child) {
        if (child.nodeType === 1) {
            if (excludeElements.includes(child.tagName.toLowerCase())) {
                break;
            }
            matchText(child, regex, callback, validate, excludeElements);
            break;
        } else if (child.nodeType === 3) {
            let bk = 0;
            child.data.replace(regex, (...all) => {
                let args = [].slice.call(all);
                if (validate && !validate(args[0])) {
                    return;
                }
                let offset = args[args.length - 2];
                let newTextNode = child.splitText(offset+bk);
                let tag;
                bk -= child.data.length + all[0].length;

                newTextNode.data = newTextNode.data.substr(all[0].length);
                tag = callback.apply(window, [child].concat(args));
                child.parentNode.insertBefore(tag, newTextNode);
                child = newTextNode;
            });
            regex.lastIndex = 0;
            break;
        }
        child = child.nextSibling;
    }

    return node;
}

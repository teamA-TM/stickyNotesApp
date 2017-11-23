var noteView = (function (board) {
    var init = function () {
        createAddElem(board)
    },

        findParentClassName = function (elem, classNameRegex) {
            if (elem.className.search(classNameRegex) >= 0)
                return elem;
            var parent = elem.parentNode
            if (parent && parent.nodeName != "#document")
                return findParentClassName(elem.parentNode, classNameRegex)
            else return false;
        },

        createAddElem = function () {
            var doc = board.ownerDocument || board,

                addElemString = '<div class="note note-add">' +
                    '<div class="add"></div>' +
                    '</div>',
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(addElemString, doc, fragment);
            board.appendChild(fragment);
        },

        getNodes = function (htmlString, doc, fragment) {
            var map = {
                "<td": [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                "<th": [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                "<tr": [2, "<table><thead>", "</thead></table>"],
                "<option": [1, "<select multiple='multiple'>", "</select>"],
                "<optgroup": [1, "<select multiple='multiple'>", "</select>"],
                "<legend": [1, "<fieldset>", "</fieldset>"],
                "<thead": [1, "<table>", "</table>"],
                "<tbody": [1, "<table>", "</table>"],
                "<tfoot": [1, "<table>", "</table>"],
                "<colgroup": [1, "<table>", "</table>"],
                "<caption": [1, "<table>", "</table>"],
                "<col": [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                "<link": [3, "<div></div><div>", "</div>"]
            };

            var tagName = htmlString.match(/<\w+/),
                mapEntry = tagName ? map[tagName[0]] : null;
            if (!mapEntry) mapEntry = [0, "", ""];

            var div = (doc || document).createElement("div");

            div.innerHTML = mapEntry[1] + htmlString + mapEntry[2];

            while (mapEntry[0]--) div = div.lastChild;

            if (fragment) {
                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }
            }
            return div.childNodes;
        }

    init();

    board.addEventListener("click", function (event) {
        if (findParentClassName(event.target, /note-add/i)) {
            notePresenter.create();
        }

        if (findParentClassName(event.target, /delete/i)) {
            var note = findParentClassName(event.target, /note[^-]/i);
            notePresenter.delete(note.guid, note);
        }
    });

    board.addEventListener("focusout", function (event) {
        var note, parentContent = event.target.parentNode,
            elemDate = parentContent.children[2].innerText,
            data = {
                id: parentContent.guid,
                tittle: parentContent.children[0].innerText,
                message: parentContent.children[1].innerText,
                editionDate: (new Date()).toLocaleString('en-US', { hour12: false })
            }

        if (!notePresenter.edit(data))
            return;

        if (!elemDate.match(/Edited/))
            elemDate += " Edited:" + data.editionDate;
        else
            elemDate = elemDate.replace(/Edited:.+/i, function (full) {
                return full = "Edited:" + data.editionDate;
            });
        parentContent.children[2].textContent = elemDate;
    });


    return {
        removeNote: function (target) {
            board.removeChild(target);
        },
        createNoteElem: function (note) {
            var doc = board.ownerDocument || board,
                date = note.editionDate ? "Posted: " + note.creationDate + "\n Edited: " + note.editionDate : "Posted: " + note.creationDate,
                noteElemString = '<div class="note note-filled">' +
                    '<div class="note-remove"><div class="delete"></div></div>' +
                    '<div class="note-flexbox">' +
                    '<h5 class="note-tittle" contenteditable></h5>' +
                    '<p class="note-content" contenteditable></p>' +
                    '<p class="note-footer"></p>' + '</div>' + '</div>',
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(noteElemString, doc, fragment);

            if (board.lastElementChild.style.order <= note.order)
                board.lastElementChild.style.order = note.order + 1;

            fragment.children[0].style.order = note.order;
            fragment.children[0].guid = note.id;

            fragment.children[0].children[1].guid = note.id;
            fragment.children[0].children[1].children[0].innerText = note.tittle;
            fragment.children[0].children[1].children[1].innerText = note.message;
            fragment.children[0].children[1].children[2].innerText = date;

            board.insertBefore(fragment, board.lastElementChild);
        }
    }
})(document.getElementById("notebook"));
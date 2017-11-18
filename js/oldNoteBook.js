(function notebook() {
    var notes,
        guid = 0,
        numbers,
        notebook = document.getElementById("notebook");
    if (!localStorage.getItem("notes")) {
        localStorage.setItem("notes", '{"notes":{}}');
    }

    notes = JSON.parse(localStorage.getItem("notes"));
    if (notes["notes"]["last"])
        guid = notes["notes"]["last"];

    function findParentClassName(elem, classNameRegex) {
        if (elem.className.search(classNameRegex) >= 0)
            return elem;
        var parent = elem.parentNode
        if (parent && parent.nodeName != "#document")
            return findParentClassName(elem.parentNode, classNameRegex)
        else return false;
    }

    function getNodes(htmlString, doc, fragment) {
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

    function addNote(elem, guid) {
        var doc = elem.ownerDocument || elem,
            note = "",
            tittle = note.tittle || "Click Tittle",
            content = note.content || "Click content",
            date = note.date || "Posted:" + (new Date()).toLocaleString('en-US', { hour12: false });

        note = '<div class="note note-filled">' +
            '<div class="note-remove"><div class="delete"></div></div>' +
            '<div class="note-flexbox">' +
            '<h5 class="note-tittle" contenteditable></h5>' +
            '<p class="note-content" contenteditable></p>' +
            '<p class="note-footer"></p>' + '</div>' + '</div>',
            fragment = doc.createDocumentFragment(),
            scripts = getNodes(note, doc, fragment);
        if (guid) {
            fragment.children[0].guid = guid
            fragment.children[0].children[1].guid = guid
        }
        fragment.children[0].children[1].children[0].innerText = tittle;
        fragment.children[0].children[1].children[1].innerText = content;
        fragment.children[0].children[1].children[2].innerText = date;
        elem.insertBefore(fragment, elem.lastChild.previousSibling);
    }

    function removeNote(elem, target) {
        if (target.guid) {
            delete notes["notes"][target.guid];
            isEmpty = true;
            for (var key in notes["notes"]) {
                if (key !== "last" && notes["notes"][key]) {
                    isEmpty = false;
                }
            }
            if (isEmpty) {
                guid = 0;
                notes["notes"]["last"] = guid;
            }
            localStorage.setItem("notes", JSON.stringify(notes));
        }
        elem.removeChild(target);
    }

    document.addEventListener("DOMContentLoaded", function (event) {
        for (var key in notes["notes"]) {
            if (key !== "last") {
                addNote(notebook, notes["notes"][key], key)
            }
        }
    });

    notebook.addEventListener("click", function (event) {
        if (findParentClassName(event.target, /note-add/i)) {
            addNote(this);
        }

        if (findParentClassName(event.target, /delete/i)) {
            var note = findParentClassName(event.target, /note[^-]/i);
            removeNote(this, note);
        }
    });

    notebook.addEventListener("focusout", function (event) {
        var note, parentContent = event.target.parentNode,
            date = new Date(),
            data = {
                tittle: parentContent.children[0].innerText,
                content: parentContent.children[1].innerText,
                date: parentContent.children[2].innerText
            }

        if (!data.date.match(/Edited/))
            data.date += " Edited:" + date.toLocaleString('en-US', { hour12: false });
        else
            data.date = data.date.replace(/Edited:.+/i, function (full) {
                return full = "Edited:" + date.toLocaleString('en-US', { hour12: false });
            });

        if (!parentContent.guid) {
            parentContent.guid = ++guid;
            parentContent.parentNode.guid = parentContent.guid
            parentContent.children[2].textContent = data.date;
            notes["notes"][parentContent.guid] = data;
            notes["notes"]["last"] = parentContent.guid;
            localStorage.setItem("notes", JSON.stringify(notes));
        }
        else {
            note = notes["notes"][parentContent.guid];
            for (var key in note) {
                if (key !== "date" && note[key] !== data[key]) {
                    notes["notes"][parentContent.guid] = data;
                    parentContent.children[2].textContent = data.date;
                    localStorage.setItem("notes", JSON.stringify(notes));
                    break;
                }
            }
        }
    });
})();

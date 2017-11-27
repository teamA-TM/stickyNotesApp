var noteView = (function (noteApp) {
    var board, tools, searchBox;
    // Extend an object with an extension
    function extend(obj, extension) {
        for (var key in extension) {
            obj[key] = extension[key];
        }
    }

    var init = function () {
        createBoardElem();
        tools = noteApp.children[0];
        board = noteApp.children[1];
        createSearchElem();
        createRedoElem();
        createUndoElem();
        createAddElem();
        searchBox = tools.children[0];

        tools.addEventListener("click", function () {
            if (findParentClassName(event.target, /undo/i)) {
                notePresenter.undo();
            }

            if (findParentClassName(event.target, /redo/i)) {
                var note = findParentClassName(event.target, /note[^-]/i);
                notePresenter.redo();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key == "z" && event.ctrlKey || event.key == "y" && event.ctrlKey)
                event.preventDefault();
        });

        document.addEventListener("keyup", function (event) {
            if (event.key == "z" && event.ctrlKey) {
                notePresenter.undo();
            }

            if (event.key == "y" && event.ctrlKey) {
                notePresenter.redo();
            }
        });

        searchBox.addEventListener("keyup", function (event) {
            searchBox.notify(searchBox.value);
        });

        board.addEventListener("click", function (event) {
            if (findParentClassName(event.target, /note-add/i)) {
                notePresenter.create("create");
            }

            if (findParentClassName(event.target, /delete/i)) {
                var note = findParentClassName(event.target, /note[^-]/i);
                notePresenter.delete("delete", note.guid, note);
            }
        });

        board.addEventListener("focusout", function (event) {
            var parentContent = event.target.parentNode,
                elemDate = parentContent.children[2].innerText,
                data = {
                    id: parentContent.guid,
                    tittle: parentContent.children[0].value,
                    message: parentContent.children[1].value,
                    editionDate: (new Date()).toLocaleString('en-US', { hour12: false })
                }

            if (!notePresenter.edit("edit", data))
                return;

            if (!elemDate.match(/Edited/))
                elemDate += " Edited:" + data.editionDate;
            else
                elemDate = elemDate.replace(/Edited:.+/i, function (full) {
                    return full = "Edited:" + data.editionDate;
                });
            parentContent.children[2].textContent = elemDate;
        });


        board.addEventListener("dragstart", function (event) {
            var data = {
                guid: event.target.guid,
                order: event.target.style.order
            };
            event.dataTransfer.setData("text", JSON.stringify(data));
        });

        board.addEventListener("dropover", function (event) {
            event.preventDefault();
        });

        board.addEventListener("drop", function (event) {
            event.preventDefault();

            var data = JSON.parse(event.dataTransfer.getData("text")),
                noteReference = findParentClassName(event.target, /note[^-]/i);

            if (data.guid != noteReference.guid) {
                var notes = Array.from(this.children);
                data.noteReferenceGuid = noteReference.guid;
                notePresenter.orderingByDom(notes, data);
            }
        });
    },



        findParentClassName = function (elem, classNameRegex) {
            if (elem.className.search(classNameRegex) >= 0)
                return elem;
            var parent = elem.parentNode
            if (parent && parent.nodeName != "#document")
                return findParentClassName(elem.parentNode, classNameRegex)
            else return false;
        },

        createBoardElem = function () {
            var doc = noteApp.ownerDocument || noteApp,

                addElemString = '<div class="notebook-tools"></div>' +
                    '<div class="notebook-notes"></div>',
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(addElemString, doc, fragment);
            noteApp.appendChild(fragment);
        },

        createSearchElem = function () {
            var doc = tools.ownerDocument || tools,

                addElemString = '<input type="text" placeholder="Search"/>',
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(addElemString, doc, fragment);
            extend(fragment.children[0], new Subject());
            tools.appendChild(fragment);
        },

        createUndoElem = function () {
            var doc = tools.ownerDocument || tools,

                addElemString = '<div id="undo" class="undo"></div>',
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(addElemString, doc, fragment);
            extend(fragment.children[0], new Subject());
            tools.appendChild(fragment);
        },



        createRedoElem = function () {
            var doc = tools.ownerDocument || tools,

                addElemString = '<div id="redo" class="redo"></div>',
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(addElemString, doc, fragment);
            extend(fragment.children[0], new Subject());
            tools.appendChild(fragment);
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

        createNoteElem = function (note) {
            var doc = board.ownerDocument || board,
                date = note.editionDate ? "Posted: " + note.creationDate + "\n Edited: " + note.editionDate : "Posted: " + note.creationDate,
                noteElemString = '<div class="note note-filled" draggable="true">' +
                    '<div class="note-remove"><div class="delete"></div></div>' +
                    '<div class="note-flexbox">' +
                    '<textarea class="note-tittle" ></textarea>' +
                    '<textarea class="note-content" ></textarea>' +
                    '<p class="note-footer"></p>' + '</div>' + '</div>',
                fragment = doc.createDocumentFragment(),
                scripts = getNodes(noteElemString, doc, fragment);

            if (board.lastElementChild.style.order <= note.order)
                board.lastElementChild.style.order = note.order + 1;

            fragment.children[0].style.order = note.order;
            fragment.children[0].guid = note.id;

            fragment.children[0].children[1].guid = note.id;
            fragment.children[0].children[1].children[0].value = note.tittle;
            fragment.children[0].children[1].children[1].value = note.message;
            fragment.children[0].children[1].children[2].innerText = date;

            extend(fragment.children[0], new Observer());
            fragment.children[0].update = function (value) {
                var content = this.children[1].children[0].value.toLowerCase() + " " +
                    this.children[1].children[1].value.toLowerCase() + " " +
                    this.children[1].children[2].innerText.toLowerCase();


                value = value.toLowerCase();

                if (this.className.indexOf("note-hidden") < 0 &&
                    content.search(value) < 0) {

                    this.className += " note-hidden";
                }
                else if (this.className.indexOf("note-hidden") >= 0 &&
                    content.search(value) >= 0) {

                    this.className = this.className.slice(0,
                        this.className.indexOf(" note-hidden")
                    );
                }
            };

            searchBox.addObserver(fragment.children[0]);
            board.insertBefore(fragment, board.lastElementChild);
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

    return {
        debug: function () {

        },
        removeNote: function (guid, target) {
            if (target == undefined) {
                var notes = Array.from(board.children);
                target = notes.find(function (note) {
                    return note.guid == guid;
                });
            }
            searchBox.removeObserver(target);
            board.removeChild(target);
        },
        addNote: function (note) {
            createNoteElem(note);
        },
        edit: function () {
            var notes = Array.from(board.children),
                args = Array.from(arguments);
            args.forEach(function (data) {
                var note = notes.find(function (note) {
                    return note.guid == data.id;
                });
                for (const key in data) {
                    switch (key) {
                        case "tittle":
                            note.children[1].children[0].value = data[key];
                            break;
                        case "message":
                            note.children[1].children[1].value = data[key];
                            break;
                        case "creationDate":
                        case "editionDate":
                            note.children[1].children[2].innerText = data.editionDate ? "Posted: " + data.creationDate + "\n Edited: " + data.editionDate : "Posted: " + data.creationDate;
                            break;
                        case "order":
                            note.style.order = data[key];
                            break;
                        default:
                            break;
                    }
                }
            });
        }
    }
})(document.getElementById("notebook"));
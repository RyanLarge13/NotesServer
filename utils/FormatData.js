class FormatData {
  findFolder(folders, folderId) {
    for (const folder of folders) {
      if (folder.folderid === folderId) {
        return folder;
      }
      const nestedFolder = this.findFolder(folder.folders, folderId);
      if (nestedFolder) {
        return nestedFolder;
      }
    }
    return null;
  }

  toObject(userData) {
    const organizedData = {};
    userData.forEach((row) => {
      const {
        userid,
        username,
        email,
        createdat,
        folderid,
        foldertitle,
        foldercolor,
        parentfolderid,
        notefolderid,
        noteid,
        locked,
        notetitle,
        htmltext,
      } = row;
      if (!organizedData.user) {
        organizedData.user = {
          userId: userid,
          username,
          email,
          createdAt: createdat,
          folders: [],
          notes: [],
        };
      }
      const userFolders = organizedData.user.folders;
      if (!parentfolderid && !this.findFolder(userFolders, folderid)) {
        return userFolders.push({
          folderid,
          foldertitle,
          foldercolor,
          folders: [],
          notes: [],
        });
      }
      if (parentfolderid) {
        const parentFolder = this.findFolder(userFolders, parentfolderid);
        if (parentFolder) {
          parentFolder.folders.push({
            folderid,
            parentfolderid,
            foldertitle,
            foldercolor,
            folders: [],
            notes: [],
          });
        }
      }
      if (notefolderid) {
        const noteParentFolder = this.findFolder(userFolders, notefolderid);
        if (noteParentFolder) {
          noteParentFolder.notes.push({
            noteid,
            notefolderid,
            notetitle,
            locked,
            htmltext,
          });
        }
      }
    });
    return organizedData;
  }

  toSeperatedObj(rawData) {
    const organizedData = {
      user: {},
      folders: [],
      notes: [],
      trashed: [],
    };
    const doesNotExist = (array, itemId, type) =>
      !array.some((item) =>
        type === "folder" ? item.folderid === itemId : item.noteid === itemId
      );
    rawData.forEach((item) => {
      const {
        userid,
        username,
        email,
        createdat,
        folderid,
        foldertitle,
        foldercolor,
        parentfolderid,
        notefolderid,
        noteid,
        locked,
        notetitle,
        htmltext,
        notecreatedat,
        trashtitle,
        trashid,
        trashcreatedat,
        trashhtmlnotes,
        trashlocked,
      } = item;
      if (!organizedData.user.userId) {
        organizedData.user = {
          userId: userid,
          username: username,
          email: email,
          createdAt: createdat,
        };
      }
      if (doesNotExist(organizedData.folders, folderid, "folder") && folderid) {
        const folder = {
          folderid,
          color: foldercolor,
          title: foldertitle,
          parentFolderId: parentfolderid,
        };
        organizedData.folders.push(folder);
      }
      if (doesNotExist(organizedData.notes, noteid, "note") && noteid) {
        const note = {
          noteid,
          title: notetitle,
          htmlText: htmltext,
          folderId: notefolderid,
          locked: locked,
          createdAt: notecreatedat,
        };
        organizedData.notes.push(note);
      }
      if (doesNotExist(organizedData.trashed, trashid, "note")) {
        const newTrash = {
          noteid: trashid,
          title: trashtitle,
          htmlText: trashhtmlnotes,
          folderid: null,
          locked: trashlocked,
          createdAt: trashcreatedat,
        };
        organizedData.trashed.push(newTrash);
      }
    });
    return organizedData;
  }
}

export default FormatData;

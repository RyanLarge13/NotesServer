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
      if (!parentfolderid) {
        userFolders.push({
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
        const parentFolder = this.findFolder(userFolders, notefolderid);
        parentFolder.notes.push({
          noteid,
          notefolderid,
          notetitle,
          htmltext,
        });
      }
    });
    return organizedData;
  }

  toSeperatedObj(rawData) {
    const organizedData = {
      user: {},
      folders: [],
      notes: [],
    };
    const doesNotExist = (array, itemId, type) =>
      !array.some((item) =>
        type === "folder" ? item.folderId === itemId : item.noteId === itemId
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
        notetitle,
        htmltext,
        notecreatedat,
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
            createdAt: notecreatedat,
          };
          organizedData.notes.push(note);
      }
    });
    console.log(organizedData);
    return organizedData;
  }
}

export default FormatData;

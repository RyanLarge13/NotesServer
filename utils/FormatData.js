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
        };
      }
      const userFolders = organizedData.user.folders;
      if (!parentfolderid && folderid) {
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
}

export default FormatData;

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
      connections: [],
      connectionRequests: [],
      shareRequests: [],
      sharedNotes: [],
    };
    const doesNotExist = (array, itemId, type) =>
      !array.some((item) => item[type] === itemId);
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
        favorite,
        notetitle,
        htmltext,
        notecreatedat,
        trashed,
        noteupdated,
        conreqid,
        conid,
        reqid,
        sharednoteid,
        sharednotetitle,
        sharednotelocked,
        sharednotehtmltext,
        sharednotefolderid,
        sharednotecreatedat,
        sharednotetrashed,
        sharednoteupdated,
        sharereqnoteid,
        sharereqnotetitle,
        sharereqnotecreatedat,
        sharenotesfromid,
        sharenotestoid,
        conuseridone,
        conuseridtwo,
        // connectionreqemail,
        fromuseremail,
        touseremail,
        // connectionemail,
        conuseremailone,
        conuseremailtwo,
        // sharerequestsemail,
        sharereqfromemail,
        sharereqtoemail,
      } = item;
      if (!organizedData.user.userId) {
        organizedData.user = {
          userId: userid,
          username: username,
          email: email,
          createdAt: createdat,
        };
      }
      if (doesNotExist(organizedData.connections, conid, "conid") && conid) {
        const con = {
          conid,
          userOne: conuseremailone,
          userTwo: conuseremailtwo,
          idOne: conuseridone,
          idTwo: conuseridtwo,
        };
        organizedData.connections.push(con);
      }
      if (
        doesNotExist(organizedData.connectionRequests, conreqid, "conreqid") &&
        conreqid
      ) {
        const connectionRequest = {
          conreqid,
          userOne: fromuseremail,
          userTwo: touseremail,
        };
        organizedData.connectionRequests.push(connectionRequest);
      }
      if (
        doesNotExist(organizedData.shareRequests, reqid, "shareReqId") &&
        reqid
      ) {
        const shareRequest = {
          shareReqId: reqid,
          userOne: sharereqfromemail,
          userTwo: sharereqtoemail,
          note: {
            noteId: sharereqnoteid,
            title: sharereqnotetitle,
            createdAt: sharereqnotecreatedat,
          },
        };
        organizedData.shareRequests.push(shareRequest);
      }
      if (
        doesNotExist(organizedData.folders, folderid, "folderid") &&
        folderid
      ) {
        const folder = {
          folderid,
          color: foldercolor,
          title: foldertitle,
          parentFolderId: parentfolderid,
        };
        organizedData.folders.push(folder);
      }
      if (doesNotExist(organizedData.notes, noteid, "noteid") && noteid) {
        const note = {
          noteid,
          title: notetitle,
          htmlText: htmltext,
          folderId: notefolderid,
          locked: locked,
          favorite: favorite,
          createdAt: notecreatedat,
          updated: noteupdated,
          trashed: trashed,
        };
        organizedData.notes.push(note);
      }
      if (
        doesNotExist(organizedData.sharedNotes, sharednoteid, "sharednoteid") &&
        sharednoteid
      ) {
        const sharedNote = {
          sharednoteid,
          sharednotetitle,
          sharednotelocked,
          sharednotehtmltext,
          sharednotefolderid,
          sharednotecreatedat,
          sharednotetrashed,
          sharednoteupdated,
          from: sharenotesfromid,
          to: sharenotestoid,
        };
        organizedData.sharedNotes.push(sharedNote);
      }
    });
    return organizedData;
  }
}

export default FormatData;

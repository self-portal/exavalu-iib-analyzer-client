import React from "react";
import Swal from "sweetalert2";
const FileUpload = ({ files, setFiles, setFilesArray, fileArray }) => {
  const file_size = process.env.REACT_APP_FILE_SIZE;
  const uploadHandler = (event) => {
    const len = event.target.files.length;
    // for (let index = 0; index < len; index++) {
    //   var file = event.target.files[index].name;
    //   setFiles([...files, file]);
    // }
    if (event.target.files.length > process.env.REACT_APP_FILE_SIZE) {
      Swal.fire("You can add maximum 10 files");
    }
    setFiles([...event.target.files]);
    setFilesArray([...fileArray, [...event.target.files]]);
  };
  //console.log(subjob_name);
  return (
    <>
      <form>
        <input
          type="file"
          id="myfile"
          name="myfile"
          accept=".zip"
          onChange={uploadHandler}
          multiple
        />
      </form>
    </>
  );
};

export default FileUpload;

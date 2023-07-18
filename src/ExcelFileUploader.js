import React, { useState } from "react";
import * as XLSX from "xlsx";
import Dropzone from "react-dropzone";

const ExcelFileUploader = () => {
  const [data, setData] = useState([]);

  const handleFileDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Assuming the first row contains the column headers
      const headers = parsedData[0];
      const rows = parsedData.slice(1);

      const result = rows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      setData(result);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.length > 0) {
      const productArray = data.map((item) => ({
        Name: item.Name,
        Description: item.Description,
        ProductID: item["Product ID"],
        Quantity: item.Quantity,
        Price: item.Price,
      }));

      postProducts(productArray);
    } else {
      alert("Please upload an Excel file before submitting.");
    }
  };
  const postProducts = async (productArray) => {
    const url = "https://example.com/api/v1/upload-details/";
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      payload: {
        body: {
          query_type: "upload_products",
          product_array: productArray,
        },
      },
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(url, requestOptions);
      const dataResponse = await response.json();
      if (dataResponse.success === true) {
        alert("Product List Uploaded Successfully");
        window.location.reload();
      } else {
        alert("Please try again");
      }
    } catch (error) {
      alert("Please try again");
    }
  };

  return (
    <div>
      <Dropzone onDrop={handleFileDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>
              Drag and drop an Excel file here, or{" "}
              <strong>click to select one</strong> <button>Upload</button>
            </p>
          </div>
        )}
      </Dropzone>
      <button onClick={handleSubmit}>Submit</button>
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item["Product ID"]}</td>
                <td>{item.Name}</td>
                <td>{item.Description}</td>
                <td>{item.Price}</td>
                <td>{item.Quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExcelFileUploader;

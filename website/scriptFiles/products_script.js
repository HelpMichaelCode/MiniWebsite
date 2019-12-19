// JavaScript Fetch, see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// The set HTTP headers. These will be used by Fetch when making requests to the api
const HTTP_REQ_HEADERS = new Headers({
  "Accept": "application/json",
  "Content-Type": "application/json"
});



// Requests will use the GET method and permit cross origin requests
const GET_INIT = { method: 'GET', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors', cache: 'default' };

// Requests will use the GET method and permit cross origin requests
const DELETE_INIT = { method: 'DELETE', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors' };

// Proct API URL
const BASE_URL = `http://localhost:8080/`;

 // Delete
 async function deleteDataAsync(url) {

  // Try catch 
  try {
      // Call fetch and await the respose
      // Initally returns a promise
      const response = await fetch(url, DELETE_INIT);
  
      // As Resonse is dependant on fetch, await must also be used here
      const json = await response.json();
  
      // Output result to console (for testing purposes) 
      console.log(json);
  
      // Call function( passing he json result) to display data in HTML page
      //displayData(json);
      return json;
  
      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
}


// Asynchronous Function getDataAsync from a url and return
async function getDataAsync(url) {
  // Try catch 
  try {
    // Call fetch and await the respose
    // Initally returns a promise
    const response = await fetch(url, GET_INIT);

    // As Resonse is dependant on fetch, await must also be used here
    const json = await response.json();

    // Output result to console (for testing purposes) 
    console.log(json);

    // Call function( passing he json result) to display data in HTML page
    //displayData(json);
    return json;

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }

}


// Asynchronous Function to POST or PUT data to a url
async function postOrPutDataAsync(url, reqBody, reqMethod) {

  // create request object
  const request = {
      method: reqMethod,
      headers: HTTP_REQ_HEADERS,
      credentials: 'include', // important
      mode: 'cors',
      body: reqBody
      };

  // Try catch 
  try {
    // Call fetch and await the respose
    // Initally returns a promise
    const response = await fetch(url, request);

    // As Resonse is dependant on fetch, await must also be used here
    const json = await response.json();

    // Output result to console (for testing purposes) 
    console.log(json);

    // Call function( passing he json result) to display data in HTML page
    //displayData(json);
    return json;

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }

}
// Fetch.js

// --------------------------------- //

// Function to display login link if no user logged in
// When user is logged in show logout link
// Also adds an event listener or Bootstrap modal for login dialog
function showLoginLink() {
  const link = document.getElementById('loginLink')

  // Read session storage value (set during login) and set link
  if (userLoggedIn() === true) {
    link.innerHTML = 'Logout';
    link.removeAttribute('data-toggle');
    link.removeAttribute('data-target');
    link.addEventListener("click", logout);
  }
  else {
    link.innerHTML = 'Login';
    link.setAttribute('data-toggle', 'modal');
    link.setAttribute('data-target', '#LoginDialog');
    // link.addEventListener('click', login);
  }

}

async function register(){
  const url = `${BASE_URL}login/register`

  const fName = document.getElementById('fName').value;
  const lName = document.getElementById('lName').value;
  const userEmail = document.getElementById('Email').value;
  const userPassword = document.getElementById('Password').value;

  const reqBody = JSON.stringify({
    firstName: fName,
    lastName: lName,
    email: userEmail,
    password: userPassword
  });

  try{
    const json = await postOrPutDataAsync(url, reqBody, 'POST');
    alert(fName + " " + lName + " has been registered!");
    // console.log(fName + " " + lName + " has been registered!");
    console.log("Response: " + json);
  } catch (err){
    console.log("ERROR: " + err);
  }
  
  
}
// Login a user
async function login() {

  // Login url
  const url = `${BASE_URL}login/auth`

  // Get form fields
  const email = document.getElementById('email').value;
  const pwd = document.getElementById('password').value;
  // build request body
  const reqBody = JSON.stringify({
    username: email,
    password: pwd
  });

  // Try catch 
  try {
    const json = await postOrPutDataAsync(url, reqBody, 'POST');
    console.log("response: " + json.user);

    // A successful login will return a user
    if (json.user.includes("@")) {
      // If a user then record in session storage
      sessionStorage.loggedIn = true;
      sessionStorage.role = json.role;
      // force reload of page
      location.reload(true);
    } else {
      alert("Incorrect credentials");
      sessionStorage.loggedIn = false;
    }

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }

}

async function logout() {

  // logout url
  const url = `${BASE_URL}login/logout`
  // Try catch 
  try {

    // send request and via fetch
    const json = await getDataAsync(url);
    console.log("response: " + JSON.stringify(json));

    // forget user in session storage
    sessionStorage.loggedIn = false;
    sessionStorage.role = "";
    // force reload of page
    location.reload(true);


    // reload 

    // catch and log any errors
    }catch (err) {
      console.log(err);
      return err;
    }
}

function userLoggedIn() {

  if (sessionStorage.loggedIn == 'true' ) {
    return true;
  }
  else {
    return false;
  }
}


// user.js

// Parse JSON
// Create product rows
// Display in web page
function displayProducts(products) {

  const productTable = document.getElementById('productRows');

  productTable.innerHTML = '';

  const rows = products.map(product => {
  
            let rowProduct = `<tr>
                <td>${product.ProductId}</td>
                <td>${product.ProductName}</td>
                <td>${product.ProductDescription}</td>
                <td>${product.ProductStock}</td>
                <td class="price">&euro;${Number(product.ProductPrice).toFixed(2)}</td>`
      
        // If user logged in then show edit and delete buttons
        
          
        if (userLoggedIn() === true && sessionStorage.role === "Admin") {      
          rowProduct+= `<td><button class="btn btn-xs" data-toggle="modal" data-target="#ProductFormDialog" onclick="updateID(${product.ProductId}, ${product.CategoryId}, '${product.ProductName}', '${product.ProductDescription}', ${product.ProductStock}, ${product.ProductPrice});"><span class="oi oi-pencil"></span></button></td>
                   <td><button class="btn btn-xs" onclick="deleteProduct(${product.ProductId})"><span class="oi oi-trash"></span></button></td>`
        }
        
        rowProduct+= '</tr>';

       return rowProduct;
  });

  productTable.innerHTML = rows.join('');

  // let delButtons = productTable.getElementsByTagName("button");
  
  // for (let i = 0; i < delButtons.length; i++){
  //     delButtons[i].addEventListener("click", deleteProduct);
  // }
 
} 

// load and display categories
function displayCategories(categories) {
  //console.log(categories);
  const items = categories.map(category => {

    return `<a href="#" class="list-group-item list-group-item-action" onclick="updateProducts(${category.CategoryId})">${category.CategoryName}</a>`;
  });

  items.unshift(`<a href="#" class="list-group-item list-group-item-action" onclick="loadProducts()">Show all</a>`);

  // Set the innerHTML of the productRows root element = rows
  // Why use join('') ???
  document.getElementById('categoryList').innerHTML = items.join('');
} // end function

// Get products and display
async function loadProducts() {
  try {
    const categories = await getDataAsync(`${BASE_URL}category`);
    displayCategories(categories);

    const products = await getDataAsync(`${BASE_URL}product`);
    displayProducts(products);

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}

// update products when category is selected
async function updateProducts(id) {
  try {
    const products = await getDataAsync(`${BASE_URL}product/bycat/${id}`);
    displayProducts(products);

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}


// When a product is selected for update / editing, get it by id and fill out the form
async function prepareProductUpdate(id){
  try{
    const product = await getDataAsync(`${BASE_URL}product/${id}`);

    // Fill out thr form
    document.getElementById('productId').value = product.ProductId;
    document.getElementById('categoryId').value = product.CategoryId;
    document.getElementById('productName').value = product.ProductName;
    document.getElementById('productDescription').value = product.ProductDescription;
    document.getElementById('productStock').value = product.ProductStock;
    document.getElementById('productPrice').value = product.ProductPrice;
    
  }
  catch(err){
    console.log(err);
  }
}

function updateID(id, catId, prodName, prodDescription, prodStock, proPrice){
  document.getElementById('productId').value = id;
  document.getElementById('categoryId').value = catId;
  document.getElementById('productName').value = prodName;
  document.getElementById('productDescription').value = prodDescription;
  document.getElementById('productStock').value = prodStock;
  document.getElementById('productPrice').value = proPrice;
}

async function addOrUpdateProduct(){  
  let url = `${BASE_URL}product/`;

   
   const pId = Number(document.getElementById('productId').value);
   const catId = document.getElementById('categoryId').value;
   const pName = document.getElementById('productName').value;
   const pDesc = document.getElementById('productDescription').value;
   const pStock = document.getElementById('productStock').value;
   const pPrice = document.getElementById('productPrice').value;

   
   const reqBody = JSON.stringify({
   categoryId: catId,
   productName: pName,
   productDescription: pDesc,
   productStock: pStock,
   productPrice: pPrice
   });

     // Try catch 
     try {
      let json = "";
      // determine if this is an insert (POST) or update (PUT)
      // update will include product id
      if (pId > 0) {
          url+= `${pId}`;
          json = await postOrPutDataAsync(url, reqBody, 'PUT');
      }
      else {  
          json = await postOrPutDataAsync(url, reqBody, 'POST');
      }
    // Load products
    loadProducts();
    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function searchProduct(){
    
  // Retrieve the keyword input from the search bar
  let productName = document.getElementById("search").value;
  // Pass that keyword into the url endpoint
  const url = `${BASE_URL}product/search/${productName}`;

  // Pass it on then to the request body
  const request = {
      method:'GET',
      headers:HTTP_REQ_HEADERS,
      mode:'cors'
  }
  // Fetch the reponse 
  const response = await fetch(url, request);
  // Converts the response in json format
  const json = await response.json();

  // If the response is 200 ok, go into this if statement
  if(response.ok){
      console.log(`${productName} has been found`);
      // Call the display method and pass in the json variable
      // And it will display the specific product content for the user
      displayProducts(json);
  } else {
      console.log(`We could not find ${productName}`);
  }
}


// Delete product by id using an HTTP DELETE request
  async function deleteProduct(id) {
        
    if (confirm("Are you sure?")) {
        // url
        const url = `${BASE_URL}product/${id}`;
        
        // Try catch 
        try {
            const json = await deleteDataAsync(url);
            console.log("response: " + json);

            loadProducts();

        // catch and log any errors
        } catch (err) {
            console.log(err);
            return err;
        }
    }
  }

function showAddProductButton(){
  let addProductButton= document.getElementById('AddProductButton');
  if(userLoggedIn() === true){
    addProductButton.style.display = 'block';
  }
  else{
    addProductButton.style.display = 'none';
  }
}


document.getElementById("searchBtn").addEventListener("click",searchProduct);
// Load products
loadProducts();

// show login or logout
showLoginLink();
showAddProductButton();
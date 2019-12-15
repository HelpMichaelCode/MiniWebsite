// JavaScript Fetch, see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Setting headers
const HTTP_REQ_HEADERS = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json"
});

// Request will use the GET method and permit cross origin requests
const init = {method: 'GET', headers:HTTP_REQ_HEADERS, mode: 'cors', cache: 'default'};

// Passing the URL endpoint to the variable url
const BASE_API_URL = `http://localhost:8080/product`;

// Asynchronous function getDataAsync()
async function getDataAsync(){
    // Try catch
    try{
        // Call fetch and await the response
        // Intitially returns a promise
        const response = await fetch(BASE_API_URL, init); // Here we are sending the request using fetch

        // As repsonse is dependant on fetch, await must also be used here
        const json = await response.json();

        // Output result to console
        console.log(json);

        // Call function ( passing the json result ) to display data in HTML page
        displayData(json);

        // catch and log any errors
    } catch (err){
        console.log(err);
    }
}

// Display in webpage

function displayData(products){

const productTable = document.getElementById('productRows');

productTable.innerHTML = '';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
const rows = products.map(product => {
    return `<tr>
                <td>${product.ProductId}</td>
                <td>${product.CategoryId}</td>
                <td>${product.ProductName}</td>
                <td>${product.ProductDescription}</td>
                <td>${product.ProductStock}</td>
                <td class="price">&euro;${Number(product.ProductPrice).toFixed(2)}</td>
                <td><button id="${product.ProductId}" class="btn btn-xs>
                        <span class="oi oi-trash"></span>
                    </button>
                </td>
            </tr>`;
});

productTable.innerHTML = rows.join('');

let delButtons = productTable.getElementsByTagName("button");

for (let i = 0; i < delButtons.length; i++){
    delButtons[i].addEventListener("click", deleteProduct);
}
}


async function addProduct(){
    
    // Reading in the task name from the input field
    let url = `${BASE_API_URL}`;
    // Number(document.getElementById('productId').value);
    const pId = 0;
    let newCatId = document.getElementById("catId").value;
    let newProductName = document.getElementById("name").value;
    let newDesc = document.getElementById("description").value;
    let newStock = document.getElementById("stock").value;
    let newPrice = document.getElementById("price").value;

    // Validation
    if(pId === ""){
        console.log("no data to add");
        return false;
    }
    if(newCatId === ""){
        console.log("no data to add");
        return false;
    }
    if(newProductName === ""){
        console.log("no data to add");
        return false;
    }
    if(newDesc === ""){
        console.log("no data to add");
        return false;
    }
    if(newStock === ""){
        console.log("no data to add");
        return false;
    }
    if(newPrice === ""){
        console.log("no data to add");
        return false;
    }

    let reqBody = JSON.stringify({
        categoryId: newCatId,
        productName: newProductName,
        productDescription: newDesc,
        productStock:  newStock,
        productPrice: newPrice
    });
    console.log("Request body is: " + reqBody);

    let request = {
        method: 'POST',
        headers: HTTP_REQ_HEADERS,
        mode: 'cors',
        cache: 'default',
        body: reqBody
    };

    // Send request via fetch api to url of API
    // Get response back (as JS Promise)

    let reponse = await fetch(url, request);

    if(reponse.ok){
        // Log the status - view in the console
        // View browser console for details
        console.log("reponse from post request - ", reponse);

        // reload the data
        getDataAsync();
    } else {
        // error 
        console.log("error adding product: " + reponse);
    }
    return false;
}

async function deleteProduct(){
    let id = this.id;
    console.log(`deleting ${id}`);

    // the url to send this request
    const url = `${BASE_API_URL}/${id}`;

    const request = {
        method: 'DELETE',
        headers: HTTP_REQ_HEADERS,
        mode: 'cors'
    }

    const response = await fetch(url, request);

    if(response.ok){
        console.log(`Product item with id ${id} was deleted`);

        getDataAsync();
    } else {
        console.log(`error deleting todo with ${id}`);
    }
}

// set up add item button
document.getElementById("btnAdd").addEventListener("click", addProduct);

// for(let i = 0; i < )
// Call the function
getDataAsync();
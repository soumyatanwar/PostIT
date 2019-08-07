
const form = document.querySelector('form');
const mewsElement = document.querySelector('.mews');
const loadingElement = document.querySelector('.loading');

loadingElement.style.display = '';
const API_URL = 'http://localhost:5050/mews';

//Show all mews when the page loads
listAllMews();

form.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Form was submitted');

    const formData = new FormData(form);
    const name = formData.get('name');
    const content = formData.get('content');
    const mew = {
        name,
        content
    };
    
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(mew),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => {
            if(response.ok) 
            //it is a must to handle errors like this, in case response is not being returned in json
            //we must ensure that it does not return html code to show the http error status
                return response.json()
            else 
                throw Error('Request rejected with status ${response.status}');
            })
        .then(createdMew => {
            form.reset(),
            listAllMews();
            form.style.display ='';
            loadingElement.style.display = 'none'
        })

    form.style.display = 'none';
    loadingElement.style.display = '';
})

function listAllMews(){
    //every time we add a new mew, we need to reload the list, but we need to ensure that we don't redundantly repeat mews
    //so...
    mewsElement.innerHTML = ''; //clears out all the DOM objects corresponding to the mew feed
    // when making a GET request we do not need to specify anything, fetch makes GET requests by default
    fetch(API_URL) 
        .then(response => {
            if(response.ok)
                return response.json()
            else 
                throw Error('Request rejected with status ${response.status}');
            })
        .then(mews =>{
            console.log(mews),
            mews.reverse();
            mews.forEach(mew => {
                const div = document.createElement('div');

                const header = document.createElement('h3') //shows the name of the author of mew
                header.textContent = mew.name; // security reason for not using innerHTML
                // even if the user had entered valid HTML or a script it won't get rendered as HTML
                // only as plain text , prevents cross site scripting

                const contents = document.createElement('p') //creates a paragraph tag containing content of mew
                contents.textContent = mew.content;

                const date = document.createElement('small')
                date.textContent = mew.created_date;

                // but now the above tags need to put on the page, till here they've just been created
                div.appendChild(header);
                div.appendChild(contents);
                div.appendChild(date);
                mewsElement.appendChild(div);
            });
                loadingElement.style.display = 'none';
        });
}
function signin(username, password) {
  const signinRequestBody = JSON.stringify({ user: username, password });
  const signinRequestOptions = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: signinRequestBody
  };
  
  fetch('https://localhost:3000/signin', signinRequestOptions)
    .then(response => response.json())
    .then(data => {
      console.log(data); 
  })
  .catch(error => {
    console.error('Error:', error);
    });
  }

function signup(username, password) {
  const signupRequestBody = JSON.stringify({ user: username, password });
  const signupRequestOptions = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: signupRequestBody
  };
    
  fetch('https://localhost:3000/signup', signupRequestOptions)
    .then(response => response.json())
    .then(data => {
      console.log(data); 
  })
  .catch(error => {
    console.error('Error:', error);
    });
  }
  

function session() {
  
  const sessionRequestOptions = {
    method: 'GET',
    credentials: 'include'
  };
    
  fetch('https://localhost:3000/session', sessionRequestOptions)
    .then(response => response.json())
    .then(data => {
      console.log(data); 
  })
  .catch(error => {
    console.error('Error:', error);
    });
  }

function signout() {
  
  const signoutRequestOptions = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  };
    
  fetch('https://localhost:3000/signout', signoutRequestOptions)
    .then(response => response.json())
    .then(data => {
      console.log(data); 
  })
  .catch(error => {
    console.error('Error:', error);
    });
  }
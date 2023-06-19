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
      console.log(data)
      window.location.href = 'signedin.html'
  })
  .catch(error => {
    console.error('Error:', error);
    });
  }

function signup(email, username, password) {
  const signupRequestBody = JSON.stringify({email, user: username, password });
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
      window.location.href = 'verify.html' 
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
      if (data.verified === false){
        window.location.href = 'verify.html'
      }
      else{
        console.log(data); 
        document.getElementById('apikey').textContent = data.apikey
        document.getElementById('secretkey').textContent = data.secretkey
      }
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
      window.location.href = 'client.html' 
  })
  .catch(error => {
    console.error('Error:', error);
    });
  }

function verify(id) {
  const verifyRequestBody = JSON.stringify({ verify: id});
  const verifyRequestOptions = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: verifyRequestBody
  };
      
  fetch('https://localhost:3000/verify', verifyRequestOptions)
    .then(response => response.json())
    .then(data => {
      console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
    });
  }
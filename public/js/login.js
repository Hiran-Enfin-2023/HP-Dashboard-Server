document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:5000/rest/login-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      console.log(response);
  
      if (response.ok) {
        const res = await response.json();
        console.log(res);
        localStorage.setItem('access-token', res.results.access_token);
        window.location.href = 'http://localhost:5000/dashboard';
      } else {
        const error = await response.json();
        alert('Login failed: ' + error.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }

  });
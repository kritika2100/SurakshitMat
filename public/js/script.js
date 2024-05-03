document.addEventListener('DOMContentLoaded', function() {
    const voteLinks = document.querySelectorAll('.vote-link');
  
    voteLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const candidateName = this.parentNode.parentNode.querySelector('td:nth-child(2)').innerText;
        showPopup(candidateName);
      });
    });
  
    function showPopup(candidateName) {
      const popup = document.createElement('div');
      popup.classList.add('popup', 'active');
      popup.innerHTML = `
        <p>You are voting for ${candidateName}. Are you sure?</p>
        <button id="voteBtn">Vote</button>
        <button id="cancelBtn">Cancel</button>
      `;
      document.body.appendChild(popup);
  
      const voteBtn = popup.querySelector('#voteBtn');
      const cancelBtn = popup.querySelector('#cancelBtn');
  
      voteBtn.addEventListener('click', function() {
        // Perform voting action here
        alert('You have voted successfully.');
        popup.remove();
      });
  
      cancelBtn.addEventListener('click', function() {
        popup.remove();
      });
    }
  });
  
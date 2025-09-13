// Minimal terminal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize terminal interactions
  initTerminalInteractions();
});

function initTerminalInteractions() {
  // Handle file/folder clicks in terminal
  const fileItems = document.querySelectorAll('.file-item');
  fileItems.forEach(item => {
    item.addEventListener('click', function() {
      const folder = this.getAttribute('data-folder');
      const file = this.getAttribute('data-file');
      const resume = this.getAttribute('data-resume');
      
      if (folder) {
        showFolderContent(folder);
      } else if (file) {
        showFileContent(file);
      } else if (resume) {
        // Open resume in new tab
        window.open('/ryan_dielhenn_resume.pdf', '_blank');
      }
    });
  });
  
  // Handle back navigation
  const backButtons = document.querySelectorAll('.back-btn');
  backButtons.forEach(button => {
    button.addEventListener('click', function() {
      showRootContent();
    });
  });
}

function showFolderContent(folderName) {
  // Hide all content
  const allContent = document.querySelectorAll('.terminal-content');
  allContent.forEach(content => content.classList.add('hidden'));
  
  // Show the requested folder content
  const targetContent = document.getElementById(`${folderName}-content`);
  if (targetContent) {
    targetContent.classList.remove('hidden');
  }
}

function showFileContent(fileName) {
  // Hide all content
  const allContent = document.querySelectorAll('.terminal-content');
  allContent.forEach(content => content.classList.add('hidden'));
  
  // Show the requested file content
  const targetContent = document.getElementById(`${fileName}-content`);
  if (targetContent) {
    targetContent.classList.remove('hidden');
  }
}

function showRootContent() {
  // Hide all content
  const allContent = document.querySelectorAll('.terminal-content');
  allContent.forEach(content => content.classList.add('hidden'));
  
  // Show root content
  const rootContent = document.getElementById('root-content');
  if (rootContent) {
    rootContent.classList.remove('hidden');
  }
}

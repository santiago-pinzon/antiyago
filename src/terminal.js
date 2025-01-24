import { marked } from 'marked';

const commands = {
    echo: {fn: (args) => getEcho(args), help: "Print out text to the console. Usage: echo [text]"}, // TODO add html sanitization.https://github.com/cure53/DOMPurify
    help: {fn: (args) => getHelp(args), help: "Get help on commands. Usage: help [command]"},
    clear: {fn: () => {
        document.getElementById('output_box').innerHTML = ''; // Clear terminal output
        return '';
    }, help: "Clears the console."},
    ls: {fn: (args) => getFiles(args), help: "List the available directories. Usage: ls [dir]"},
    cd: {fn: (args) => getCD(args), help: "Move to a different directory. Usage: cd [path/to/dir]"},
    cat: {fn: (args) => getCat(args), help: "Display the contents of a file. Usage: cat [path/to/file]"},
    theme: {fn: (args) => changeTheme(args), help: "Change the display theme. Usage: theme [dark, lite, retro]"}
};

export const themes = {
  lite: "lite_mode.css",
  dark: "dark_mode.css",
  retro: "retro_mode.css"
}

export function commandParser (input) {
    const parts = input.trim().split(/\s+/); // Split input into command and args
    const command = parts[0]; // First word is the command
    const args = parts.slice(1); // Remaining parts are the arguments

    if (commands[command]) {
        return commands[command]["fn"](args); // Execute the command
    } else {
        const output_div = document.createElement('div');
        output_div.textContent = `Command not found: ${command}`; // Handle unknown commands
        output_div.className = 'error-message';
        return output_div;
    }
};

function changeTheme(args) {
  const theme_output = document.createElement('div');
  // Validate our arguments (should probably break out into a wrapper eventually.)
  if (args.length > 1) {
    theme_output.className = 'error-message';
    theme_output.textContent = 'Too many arguments provided please try again.';
    return theme_output;
  }
  if ((args.length < 1) || (!Object.keys(themes).includes(args[0]))) {
    theme_output.className = "error-message";
    theme_output.textContent = `Please provide a valid theme. Valid options are {${Object.keys(themes).join(', ')}}`;
    return theme_output;
  }
  if (localStorage.getItem("theme") === args[0]) {
    theme_output.className = "error-message";
    theme_output.textContent = `Theme ${args[0]} is already active.`;
    return theme_output;
  }
  document.getElementById("themeStylesheet").setAttribute("href", themes[args[0]]);
  localStorage.setItem("theme", args[0]);
  theme_output.className = "output";
  theme_output.textContent = `Theme has been updated to ${args[0]}`;
  return theme_output;
}

function getCat(args) {
  // Returns the content of a file (page)
  const cat_output = document.createElement('div');

  // Validate our arguments (should probably break out into a wrapper eventually.)
  if (args.length > 1) {
    cat_output.className = 'error-message';
    cat_output.textContent = 'Too many arguments provided please try again.';
    return cat_output;
  }
  if (args.length < 1) {
    cat_output.className = "error-message";
    cat_output.textContent = "Please provide a path.";
    return cat_output;
  }

  // parse our path
  let path = args[0].split('/')
  let file = path.pop()

  // Navigate to the resulting dir.
  let dir = getDir(path.join('/') ?? window.currentDir);
  if (dir == null) {
    cat_output.className = "error-message";
    cat_output.textContent = "Invalid path given please try again.";
    return cat_output;
  }

  fetch(`files/${file}`) // Path to your .md or .txt file
    .then(response => {
      if (!response.ok || response.headers.get('Content-Type') == 'text/html') {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); // Convert response to text
    })
    .then(data => {
      // Display the file content in an element
      if (file.endsWith('.txt')) {
        cat_output.innerText = data;
      }
      else if (file.endsWith('.md')) {
        cat_output.innerHTML = marked(data);
      }
    })
    .catch(error => {
      cat_output.className = "error-message";
      cat_output.textContent = "File not found please try again.";
      return cat_output;
    });

  return cat_output;
}

function getEcho(args) {
    const echoOutput = document.createElement('div');
    echoOutput.className = "output";
    echoOutput.textContent = args.join(' ');
    return echoOutput;
}

function getHelp(args) {
    const help_output = document.createElement('div');
    if (!args.length) {
      const help_top_div = document.createElement('div');
      const help_span_top = document.createElement('span');

      help_span_top.className = 'help-statement';
      help_span_top.textContent = `${Object.keys(commands).join(' ')}`;

      help_top_div.appendChild(help_span_top);

      const help_span_bot = document.createElement('span');

      help_span_bot.className = "output";
      help_span_bot.textContent = "Type `help` followed by a command for more information.";

      help_output.appendChild(help_top_div);
      help_output.appendChild(help_span_bot);
    }
    else if (args.length > 2) {
      help_output.className = 'error-message';
      help_output.textContent = 'Too many arguments provided please try again.';
    }
    else if (!Object.keys(commands).includes(args[0])) {
      help_output.className = 'error-message';
      help_output.textContent = 'Unable to recognize command please try again.';
    }
    else {
      const comm_span = document.createElement('span');
      comm_span.className = "error-message";
      comm_span.textContent = args[0];

      const help_span = document.createElement('span');
      help_span.className = 'output';
      help_span.textContent = ': ' + commands[args[0]]['help'];

      help_output.appendChild(comm_span);
      help_output.appendChild(help_span);
    }

    return help_output;
}

function getCD(args) {
  // Change the Directory
  const cd_output = document.createElement('div');
  if (args.length > 1) {
    cd_output.className = 'error-message';
    cd_output.textContent = 'Too many arguments provided please try again.';
    return ls_output;
  }
  if (args.length < 1) {
    cd_output.className = "error-message";
    cd_output.textContent = "Please provide a path.";
    return cd_output;
  }

  let dir = getDir(args[0]);

  if (dir == null) {
    cd_output.className = "error-message";
    cd_output.textContent = "Path is invalid, please try again.";
    return cd_output;
  }
  window.currentDir = dir['path'];
  cd_output.className = "output";
  cd_output.textContent = `Changed dir to ${args[0]}`;
  return cd_output;
}

function getDir(path=window.currentDir) {
  // First we need to determine if relative or absolute
  if (!path.startsWith('/') && !path.startsWith('~/')) {
    // relative
    path = window.currentDir + "/" + path;
  }

  path = path.split("/").filter(part => part !== "");

  // Now we nagivate through our Directory
  let dir = window.site_content.content;
  let visited = [];
  let new_path = []
  for (const element of path) {
    try {
      if (element === '.') {
        continue;
      }
      else if (element === '..') {
        dir = visited.pop();
        new_path.pop();
      }
      else {
        visited.push(dir);
        new_path.push(element);
        dir = dir[element]['children'];
      }
    }
    catch {
      return null;
    }
  }
  return {"path": '/' + new_path.filter(part => !['..','.'].includes(part)).join('/'),
          "dir": dir};

}

function getFiles(args) {
  const ls_output = document.createElement('div');
  ls_output.className = 'ls-grid';
  if (args.length > 1) {
    ls_output.className = 'error-message';
    ls_output.textContent = 'Too many arguments provided please try again.';
    return ls_output;
  }
  let path = (args[0] ?? window.currentDir)

  let dir = getDir(path);

  if (dir == null) {
    ls_output.className = "error-message";
    ls_output.textContent = "Path is invalid, please try again.";
    return ls_output;
  }

  for (const page of Object.values(dir['dir'])) {
    const file_span = document.createElement('span');
    file_span.textContent = page['name'];
    if (page['type'] == 'page') {
      file_span.className = 'ls-page';
    }
    else {
      file_span.className = 'ls-dir';
    }
    ls_output.appendChild(file_span)
  }
  return ls_output;
}

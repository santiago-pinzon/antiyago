const commands = {
    echo: {fn: (args) => getEcho(args), help: "Print out text to the console. Usage: echo [text]"}, // TODO add html sanitization.https://github.com/cure53/DOMPurify
    help: {fn: (args) => getHelp(args), help: "Get help on commands. Usage: help [command]"},
    clear: {fn: () => {
        document.getElementById('output_box').innerHTML = ''; // Clear terminal output
        return '';
    }, help: "Clears the console."},
    ls: {fn: (args) => getFiles(args), help: "List the available directories. Usage: ls [dir]"},
    cd: {fn: (args) => {
        if (!args.length) return "cd: missing argument";
        return `Changed directory to ${args[0]}`;
    }, help: "Move to a different directory. Usage: cd [path/to/dir]"}
};

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

function getFiles(args) {
  const ls_output = document.createElement('div');
  ls_output.className = 'ls-grid';
  if (args.length > 1) {
    ls_output.className = 'error-message';
    ls_output.textContent = 'Too many arguments provided please try again.';
    return ls_output;
  }
  let path = (args[0] ?? window.currentDir)
  if (path.startsWith(window.prefix)) {
    path = path.slice(window.prefix.length);
  }
  path = path.trim().split('/');
  console.log(path);
  let dir = window.site_content['content'];
  for (const p of path) {
    console.log(p);
    console.log(dir);
    if (!Object.keys(dir).includes(p)) { // Dir is a list of dicts need to account for that.
      ls_output.className = 'error-message';
      ls_output.textContent = 'Path is invalid please try again.';
      return ls_output;
    }
    dir = dir[p];
  }
  for (const page of dir['children']) {
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

var _ = require("lodash");
var p = require("path");

var autocompleteScript = module.exports = {};

autocompleteScript.fishScript = function(exec) {
  var name = p.basename(exec, ".js");

  return '# Fish completion for ' + name + '\n' +
'function __' + name + '_autocomplete\n' +
'  set -l tokens (commandline -opc)\n' +
'  set -l current (commandline -ct)\n' +
'  set -l index (count $tokens)\n' +
'\n' +
'  set -l args\n' +
'  set -a args --autocomplete-index $index\n' +
'  for word in $tokens\n' +
'    set -a args --autocomplete-words="$word"\n' +
'  end\n' +
'  set -a args --autocomplete-words="$current"\n' +
'\n' +
'  set -l compgen_cmd (' + exec + ' $args 2>/dev/null)\n' +
'\n' +
'  # Parse compgen output to extract words\n' +
'  if string match -q -- "*-W *" $compgen_cmd\n' +
'    # Extract word list from -W $\'word1\\nword2\' format\n' +
'    set -l wordlist (string replace -r ".*-W \\$\'" "" -- $compgen_cmd | string replace -r "\'.*" "")\n' +
'    for word in (string split "\\n" -- $wordlist)\n' +
'      if string match -q -- "$current*" $word\n' +
'        echo $word\n' +
'      end\n' +
'    end\n' +
'  end\n' +
'\n' +
'  # Handle file completion (-f flag)\n' +
'  if string match -q -- "*-f *" $compgen_cmd\n' +
'    __fish_complete_path "$current"\n' +
'  end\n' +
'\n' +
'  # Handle directory completion (-d flag)\n' +
'  if string match -q -- "*-d *" $compgen_cmd\n' +
'    __fish_complete_directories "$current"\n' +
'  end\n' +
'end\n' +
'\n' +
'complete -c ' + name + ' -f -a "(__' + name + '_autocomplete)"';
}

autocompleteScript.bashScript = function(exec, zshCompat) {
  zshCompat = !!zshCompat;
  var fname = p.basename(exec, ".js");
  var name = p.basename(exec);
  var path = p.normalize(exec);

  return (zshCompat ? '#compdef ' + name + '\nautoload -U +X bashcompinit && bashcompinit\n' : '') +
  '_' + fname + '()\n'+
'{\n'+
'  local ARGS COMPGENCMD\n'+
'\n'+
'  cur=${COMP_WORDS[COMP_CWORD]};\n'+
'\n'+
'  ARGS=(--autocomplete-index $COMP_CWORD)\n'+
'  for word in ${COMP_WORDS[@]}; do\n'+
'    ARGS=(${ARGS[@]}  --autocomplete-words="$word")\n'+
'  done\n'+
'\n'+
'  COMPGENCMD=( $(' + exec + ' "${ARGS[@]}") )\n'+
'\n'+
'  COMPREPLY=( $(eval ${COMPGENCMD[@]}) )\n'+
'\n'+
'  return 0;\n'+
'}\n'+
'complete -o nospace -F _' + fname + ' ' + name;

}

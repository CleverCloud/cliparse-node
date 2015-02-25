var _ = require("lodash");
var p = require("path");

var autocompleteScript = module.exports = {};

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

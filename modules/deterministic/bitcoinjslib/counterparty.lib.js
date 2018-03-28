function padprefix(str, max) {
  str = str.toString();
  return str.length < max ? padprefix('0' + str, max) : str;
}

function assetid(asset_name) {
  asset_name = asset_name.toUpperCase();
  if (asset_name == "XCP") {

    var asset_id = (1).toString(16);

  } else if (asset_name.substr(0, 1) == "A") {

    var pre_id = asset_name.substr(1);

    var pre_id_bigint = BigIntegerSM(pre_id);

    var asset_id = pre_id_bigint.toString(16);

  } else {

    var b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var name_array = asset_name.split("");

    var n_bigint = BigIntegerSM(0);

    for (i = 0; i < name_array.length; i++) {

      n_bigint = BigIntegerSM(n_bigint).multiply(26);
      n_bigint = BigIntegerSM(n_bigint).add(b26_digits.indexOf(name_array[i]));

    }

    var asset_id = n_bigint.toString(16);
  }

  return asset_id;

}

function create_xcp_send_data(asset_name, amount) {

  var prefix = "1c434e54525052545900000000"; //CNTRPRTY
  var trailing_zeros = "000000000000000000000000000000000000000000000000000000000000000000";
  var asset_id = assetid(asset_name);

  var asset_id_hex = padprefix(asset_id, 16);
  var amount_round = parseInt((amount*100000000).toFixed(0));

  var amount_hex = padprefix((amount_round).toString(16), 16);

  var data = prefix + asset_id_hex + amount_hex + trailing_zeros;

  return data;

}

function create_xcp_send_data_opreturn(asset_name, amount) {

  var prefix = "434e54525052545900000000"; //CNTRPRTY
  var asset_id = assetid(asset_name);

  var asset_id_hex = padprefix(asset_id.toString(16), 16);

  var amount_round = parseInt((amount*100000000).toFixed(0));

  var amount_hex = padprefix((amount_round).toString(16), 16);

  var data = prefix + asset_id_hex + amount_hex;

  return data;
}

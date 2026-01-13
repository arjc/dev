function cp() {
  const input = document.getElementById("pswdOut");
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(input.value);
}
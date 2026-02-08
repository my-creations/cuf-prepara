export const setText = (node, value) => {
  if (!node) {
    return;
  }
  node.textContent = value;
};

export const clearChildren = (node) => {
  if (!node) {
    return;
  }
  node.innerHTML = "";
};

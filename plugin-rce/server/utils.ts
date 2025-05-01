export function is_custom_element(tag_name?: string) {
  if (!tag_name) return false;
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(tag_name)
}
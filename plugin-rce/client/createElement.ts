

function createElement(tag_name: string, attributes: { [key: string]: any } | null, ...children: any[]) {



  return {
    tag_name,
    attributes,
    children
  }
}

export default createElement;
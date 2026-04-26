const parse = (xmlString) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml')

  const errorNode = xmlDoc.querySelector('parsererror')
  if (errorNode) {
    const error = new Error('Invalid RSS')
    error.isParserError = true
    throw error
  }

  const channel = xmlDoc.querySelector('channel')
  if (!channel) {
    const error = new Error('Invalid RSS')
    error.isParserError = true
    throw error
  }

  const title = channel.querySelector('title').textContent
  const description = channel.querySelector('description').textContent

  const items = Array.from(channel.querySelectorAll('item')).map((item) => {
    const itemTitle = item.querySelector('title').textContent
    const itemLink = item.querySelector('link').textContent
    const itemDescription = item.querySelector('description').textContent
    return {
      title: itemTitle,
      link: itemLink,
      description: itemDescription,
    }
  })

  return { title, description, items }
}

export default parse

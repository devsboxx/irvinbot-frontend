import client from './client'

export const uploadDocument = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.postForm('/docs/upload', formData)
}

export const listDocuments = () => client.get('/docs/')

export const deleteDocument = (id) => client.delete(`/docs/${id}`)

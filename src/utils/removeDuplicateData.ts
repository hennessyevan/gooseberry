export async function removeDuplicateData(smartMap: any, data: any[]) {
  data.forEach(entry => {
    const id = entry._id || entry.id
    if (smartMap[id]) {
      delete data[id]
    }
  })

  return data
}

import * as xlsx from 'xlsx'
import isBlob from 'is-blob'
import { omit } from 'lodash'

/**
 * 读取 xlsx 文件
 * @param file File | Blob
 */
export function readXlsxFileReader (file: File | Blob): Promise<xlsx.WorkBook> {
  if (!isBlob(file)) {
    file = new Blob([file], { type: (<File> file).type })
  }
  return new Promise((resolve, reject) => {
    let xlsxTypes: string[] = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    if (!xlsxTypes.includes(file.type || 'application/vnd.ms-excel')) {
      reject('请选择正确的文件格式')
    }
    let reader: FileReader = new FileReader()
    reader.onload = () => {
      let data: Uint8Array = new Uint8Array(reader.result as ArrayBuffer)
      resolve(xlsx.read(data, { type: 'array', cellHTML: false }))
    }
    reader.onerror = (err: any) => {
      reject(err)
    }
    reader.readAsArrayBuffer(file)
  })
  
}

/**
 * 获取 xlsx 字段集
 * @param workbook xlsx.WorkBook
 * @param sheetName string
 */
export function getXlsxFields (workbook: xlsx.WorkBook, sheetName: string): string[] {
  let sheet: xlsx.WorkSheet = getXlsxSheet(workbook, sheetName)
  return Array.from(new Set(Object.keys(sheet).map( o => o.replace(/^([A-Z]{1,3})(\d{1,9})$/, '$1'))))
}

/**
 * 获取 xlsx Sheet
 * @param workbook 
 * @param sheetName 
 */
export function getXlsxSheet (workbook: xlsx.WorkBook, sheetName: string): xlsx.WorkSheet {
  let _sheetName: string = workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0]
  return omit(workbook.Sheets[_sheetName], ['!ref', '!margins'])
}

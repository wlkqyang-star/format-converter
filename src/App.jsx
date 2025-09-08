import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  FileText, 
  FileSpreadsheet, 
  Image, 
  Video, 
  ScanText, 
  ArrowRightLeft,
  Upload,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import './App.css'

const conversionTypes = [
  {
    id: 'json-csv',
    title: 'JSON ↔ CSV',
    description: '数据格式互转',
    icon: FileSpreadsheet,
    formats: ['JSON', 'CSV'],
    color: 'bg-blue-500'
  },
  {
    id: 'markdown-rtf',
    title: 'Markdown ↔ RTF',
    description: '文档格式互转',
    icon: FileText,
    formats: ['MD', 'DOCX'],
    color: 'bg-green-500'
  },
  {
    id: 'image-format',
    title: 'HEIC/WEBP/AVIF ↔ JPG/PNG',
    description: '图片格式转换',
    icon: Image,
    formats: ['HEIC', 'WEBP', 'AVIF', 'JPG', 'PNG'],
    color: 'bg-purple-500'
  },
  {
    id: 'video-gif',
    title: '视频 → GIF',
    description: '视频转动图',
    icon: Video,
    formats: ['MP4', 'AVI', 'MOV', 'GIF'],
    color: 'bg-orange-500'
  },
  {
    id: 'image-to-text-ocr',
    title: '图片 → 文本 (OCR)',
    description: '光学字符识别',
    icon: ScanText,
    formats: ['JPG', 'PNG', 'PDF', 'TXT'],
    color: 'bg-red-500'
  },
  {
    id: 'image-to-searchable-pdf-ocr',
    title: '图片 → 可搜索PDF (OCR)',
    description: '生成可搜索PDF',
    icon: ScanText,
    formats: ['JPG', 'PNG', 'PDF'],
    color: 'bg-indigo-500'
  }
]

function App() {
  const [selectedType, setSelectedType] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState('png')
  const [isConverting, setIsConverting] = useState(false)
  const [convertProgress, setConvertProgress] = useState(0)
  const [convertResult, setConvertResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
      setConvertResult(null)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
      setConvertResult(null)
    }
  }

  const handleConvert = async () => {
    if (!selectedType || !uploadedFile) {
      setError('请选择转换类型并上传文件')
      return
    }

    setIsConverting(true)
    setConvertProgress(0)
    setError(null)

    try {
      // 模拟转换进度
      const progressInterval = setInterval(() => {
        setConvertProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append('file', uploadedFile)
      
      // 为图片格式转换添加目标格式
      if (selectedType === 'image-format') {
        formData.append('target_format', targetFormat || 'png')
      }
      
      // 调用后端API
      const response = await fetch(`https://77h9ikc6vnnv.manus.space/api/convert/${selectedType} `, {
        method: 'POST',
        body: formData
      } )


      clearInterval(progressInterval)
      setConvertProgress(100)

      if (response.ok) {
        // 检查响应类型
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          // 如果是JSON响应，说明有错误
          const errorData = await response.json()
          throw new Error(errorData.error || '转换失败')
        } else {
          // 如果是文件响应，直接下载
          const blob = await response.blob()
          const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'converted_file'
          
          // 创建下载链接
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          setConvertResult({
            converted_filename: filename,
            download_url: url
          })
        }
      } else {
        // 尝试解析错误响应
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || '转换失败')
        } catch (parseError) {
          throw new Error(`转换失败: HTTP ${response.status}`)
        }
      }
    } catch (err) {
      setError(err.message || '转换过程中发生错误')
    } finally {
      setIsConverting(false)
    }
  }

  const resetConverter = () => {
    setSelectedType(null)
    setUploadedFile(null)
    setIsConverting(false)
    setConvertProgress(0)
    setConvertResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            格式转换器
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            支持多种文件格式转换，包括JSON/CSV、Markdown/DOCX、图片格式、视频转GIF、OCR文字识别等功能
          </p>
        </div>

        {/* 转换类型选择 */}
        {!selectedType && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
              选择转换类型
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conversionTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Card 
                    key={type.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color} text-white`}>
                          <IconComponent size={24} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{type.title}</CardTitle>
                          <CardDescription>{type.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {type.formats.map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* 转换界面 */}
        {selectedType && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${conversionTypes.find(t => t.id === selectedType)?.color} text-white`}>
                  {(() => {
                    const IconComponent = conversionTypes.find(t => t.id === selectedType)?.icon
                    return <IconComponent size={24} />
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {conversionTypes.find(t => t.id === selectedType)?.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {conversionTypes.find(t => t.id === selectedType)?.description}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={resetConverter}>
                重新选择
              </Button>
            </div>

            {/* 文件上传区域 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  上传文件
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="text-green-500" size={24} />
                      <span className="text-slate-900 dark:text-slate-100 font-medium">
                        {uploadedFile.name}
                      </span>
                      <Badge variant="secondary">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        拖拽文件到此处或点击选择文件
                      </p>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          选择文件
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 转换按钮和进度 */}
            {uploadedFile && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <Button 
                      onClick={handleConvert}
                      disabled={isConverting}
                      className="w-full"
                      size="lg"
                    >
                      {isConverting ? (
                        <>
                          <ArrowRightLeft className="mr-2 h-4 w-4 animate-spin" />
                          转换中...
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          开始转换
                        </>
                      )}
                    </Button>
                    
                    {isConverting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                          <span>转换进度</span>
                          <span>{convertProgress}%</span>
                        </div>
                        <Progress value={convertProgress} className="w-full" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 错误信息 */}
            {error && (
              <Card className="mb-8 border-red-200 dark:border-red-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 转换结果 */}
            {convertResult && (
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle size={20} />
                    转换完成
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">
                        {convertResult.converted_filename}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        文件已自动下载到您的设备
                      </p>
                    </div>
                    <Button onClick={() => setConvertResult(null)} variant="outline">
                      转换新文件
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App


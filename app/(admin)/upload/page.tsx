'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { Upload as UploadIcon, FileText, Download, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'

interface UploadResult {
  success: boolean
  message: string
  stats?: {
    total: number
    success: number
    failed: number
  }
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const response = await fetch('/api/upload/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ students: results.data }),
          })

          const data = await response.json()
          setResult(data)
          setUploading(false)

          // Toast 메시지 표시
          if (data.success) {
            toast.success(data.message)
          } else {
            toast.error(data.message)
          }
        },
        error: (error) => {
          const errorResult = {
            success: false,
            message: `CSV 파싱 오류: ${error.message}`,
          }
          setResult(errorResult)
          setUploading(false)
          toast.error(errorResult.message)
        },
      })
    } catch (error) {
      const errorResult = {
        success: false,
        message: '업로드 중 오류가 발생했습니다.',
      }
      setResult(errorResult)
      setUploading(false)
      toast.error(errorResult.message)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-h2 sm:text-h1 text-[var(--foreground)] mb-2">데이터 업로드</h1>
        <p className="text-body text-[var(--foreground-muted)]">
          학생 역량 데이터를 CSV 파일로 업로드하세요
        </p>
      </div>

      {/* CSV 형식 안내 */}
      <Card variant="outlined" className="border-[var(--info)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[var(--info)]" />
            <CardTitle>CSV 파일 형식</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-[var(--surface-variant)] rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
            <div className="text-[var(--foreground)]">
              studentId,name,email,department,grade,creativity,collaboration,problemSolving
            </div>
            <div className="text-[var(--foreground-muted)]">
              20240001,홍길동,hong@example.com,컴퓨터공학과,2,75,82,68
            </div>
            <div className="text-[var(--foreground-muted)]">
              20240002,김철수,kim@example.com,경영학과,3,88,76,91
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-[var(--info-light)] rounded-lg">
            <AlertCircle className="h-4 w-4 text-[var(--info)] flex-shrink-0 mt-0.5" />
            <p className="text-body text-[var(--info)]">
              첫 번째 행은 헤더여야 하며, 역량 점수는 0-100 사이의 숫자입니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 파일 업로드 영역 */}
      <Card variant="elevated">
        <CardContent className="p-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                : 'border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />

            {!file ? (
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto">
                  <UploadIcon className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-h4 text-[var(--foreground)] mb-2">
                    CSV 파일을 드래그하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-body text-[var(--foreground-muted)]">
                    지원 형식: .csv
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  파일 선택
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-h4 text-[var(--foreground)] mb-1">{file.name}</p>
                  <p className="text-body text-[var(--foreground-muted)]">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                    loading={uploading}
                    leftIcon={<UploadIcon className="h-4 w-4" />}
                    size="lg"
                  >
                    업로드 시작
                  </Button>
                  <Button variant="outline" onClick={handleRemoveFile} disabled={uploading}>
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 업로드 중 */}
      {uploading && <Loading size="lg" text="CSV 파일을 업로드하고 처리하는 중..." />}

      {/* 업로드 결과 */}
      {result && (
        <Card
          variant="outlined"
          className={
            result.success ? 'border-[var(--success)]' : 'border-[var(--error)]'
          }
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-[var(--success)]" />
              ) : (
                <XCircle className="h-6 w-6 text-[var(--error)]" />
              )}
              <CardTitle>
                {result.success ? '업로드 완료' : '업로드 실패'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={`text-body mb-4 ${
                result.success ? 'text-[var(--success)]' : 'text-[var(--error)]'
              }`}
            >
              {result.message}
            </p>

            {result.stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card variant="outlined">
                  <CardContent className="p-4 text-center">
                    <p className="text-caption text-[var(--foreground-muted)] mb-1">
                      전체
                    </p>
                    <p className="text-h2 text-[var(--foreground)]">
                      {result.stats.total}
                    </p>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent className="p-4 text-center">
                    <p className="text-caption text-[var(--success)] mb-1">성공</p>
                    <p className="text-h2 text-[var(--success)]">
                      {result.stats.success}
                    </p>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent className="p-4 text-center">
                    <p className="text-caption text-[var(--error)] mb-1">실패</p>
                    <p className="text-h2 text-[var(--error)]">{result.stats.failed}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 샘플 CSV 다운로드 */}
      <Card variant="interactive">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-label text-[var(--foreground)]">샘플 CSV 파일</p>
                <p className="text-caption text-[var(--foreground-muted)]">
                  참고용 샘플 데이터를 다운로드하세요
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => {
                const link = document.createElement('a')
                link.href = '/sample-students.csv'
                link.download = 'sample-students.csv'
                link.click()
              }}
            >
              다운로드
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

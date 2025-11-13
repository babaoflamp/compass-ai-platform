'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, BookOpen, Calendar, Info, Upload, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

interface Course {
  id: number
  code: string
  name: string
}

interface Material {
  id: number
  title: string
  filename: string
  createdAt: string
}

export default function MaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])

  // 과목 목록 로드
  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data)
      })
      .catch((err) => {
        console.error('Failed to fetch courses:', err)
        toast.error('과목 목록을 불러올 수 없습니다.')
      })
  }, [])

  // Drag & Drop 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt')) {
        setFile(droppedFile)
        setContent('') // 파일 선택 시 텍스트 초기화
      } else {
        setResult({
          success: false,
          message: 'TXT 파일만 업로드 가능합니다.',
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile)
        setContent('') // 파일 선택 시 텍스트 초기화
      } else {
        setResult({
          success: false,
          message: 'TXT 파일만 업로드 가능합니다.',
        })
      }
    }
  }

  // 교안 업로드
  const handleUpload = async () => {
    if (!selectedCourseId || !title || (!content && !file)) {
      setResult({
        success: false,
        message: '과목, 제목, 그리고 파일 또는 내용을 입력해주세요.',
      })
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('courseId', selectedCourseId)
      formData.append('title', title)

      if (file) {
        formData.append('file', file)
      } else if (content) {
        formData.append('content', content)
      }

      const response = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        const successMessage = '교안이 성공적으로 업로드되었습니다!'
        setResult({
          success: true,
          message: successMessage,
        })
        toast.success(successMessage)
        setTitle('')
        setContent('')
        setFile(null)
        if (selectedCourseId) {
          loadMaterials(selectedCourseId)
        }
      } else {
        const errorMessage = data.error || '업로드에 실패했습니다.'
        setResult({
          success: false,
          message: errorMessage,
        })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = '업로드 중 오류가 발생했습니다.'
      setResult({
        success: false,
        message: errorMessage,
      })
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  // 과목별 교안 목록 로드
  const loadMaterials = async (courseId: string) => {
    try {
      const response = await fetch(`/api/materials?courseId=${courseId}`)
      const data = await response.json()
      setMaterials(data.materials || [])
    } catch (error) {
      console.error('Failed to load materials:', error)
      toast.error('교안 목록을 불러올 수 없습니다.')
    }
  }

  // 과목 선택 시 교안 목록 로드
  useEffect(() => {
    if (selectedCourseId) {
      loadMaterials(selectedCourseId)
    } else {
      setMaterials([])
    }
  }, [selectedCourseId])

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-h2 sm:text-h1 text-[var(--foreground)] mb-2">교안 관리</h1>
        <p className="text-body text-[var(--foreground-muted)]">
          AI 튜터가 사용할 교안을 업로드하고 관리하세요
        </p>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 업로드 폼 */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[var(--primary)]" />
              <CardTitle>교안 업로드</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                label="과목 선택"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                options={[
                  { value: '', label: '과목을 선택하세요' },
                  ...courses.map((c) => ({
                    value: c.id.toString(),
                    label: `${c.code} - ${c.name}`,
                  })),
                ]}
              />

              <Input
                label="교안 제목"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 1주차 - 프로그래밍 기초"
              />

              {/* TXT 파일 업로드 영역 */}
              <div>
                <label className="block text-label text-[var(--foreground)] mb-2">
                  TXT 파일 업로드
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    dragActive
                      ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                      : 'border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                >
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-[var(--success)]" />
                      <span className="text-body text-[var(--foreground)]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                        }}
                        className="ml-2 text-[var(--error)] hover:underline"
                      >
                        제거
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="h-10 w-10 mx-auto text-[var(--foreground-muted)]" />
                      <p className="text-body text-[var(--foreground)]">
                        TXT 파일을 드래그하거나 클릭하여 선택하세요
                      </p>
                      <p className="text-caption text-[var(--foreground-muted)]">
                        텍스트 파일(.txt) 형식만 지원됩니다
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 또는 구분자 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]"></div>
                </div>
                <div className="relative flex justify-center text-caption">
                  <span className="px-2 bg-[var(--background)] text-[var(--foreground-muted)]">
                    또는 텍스트 직접 입력
                  </span>
                </div>
              </div>

              <Textarea
                label="교안 내용 (텍스트)"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  if (e.target.value && file) {
                    setFile(null) // 텍스트 입력 시 파일 초기화
                  }
                }}
                placeholder="교안 내용을 직접 입력하세요..."
                rows={8}
                helperText="텍스트 형식으로 입력하세요. AI 튜터는 이 내용을 참고하여 답변합니다."
                disabled={!!file}
              />

              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedCourseId || !title || (!content && !file)}
                loading={uploading}
                leftIcon={<Upload className="h-4 w-4" />}
                className="w-full"
                size="lg"
              >
                교안 업로드
              </Button>

              {/* 결과 메시지 */}
              {result && (
                <Card
                  variant="outlined"
                  className={
                    result.success ? 'border-[var(--success)]' : 'border-[var(--error)]'
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-[var(--success)]" />
                      ) : (
                        <XCircle className="h-5 w-5 text-[var(--error)]" />
                      )}
                      <p
                        className={`text-body ${
                          result.success ? 'text-[var(--success)]' : 'text-[var(--error)]'
                        }`}
                      >
                        {result.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 교안 목록 */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle>등록된 교안</CardTitle>
              </div>
              {materials.length > 0 && (
                <Badge variant="primary">{materials.length}개</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedCourseId && (
              <EmptyState
                icon={FileText}
                title="과목을 선택하세요"
                description="과목을 선택하면 교안 목록이 표시됩니다"
              />
            )}

            {selectedCourseId && materials.length === 0 && (
              <EmptyState
                icon={FileText}
                title="등록된 교안이 없습니다"
                description="새로운 교안을 업로드하여 시작하세요"
              />
            )}

            {materials.length > 0 && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                {materials.map((material) => (
                  <Card
                    key={material.id}
                    variant="interactive"
                    className="transition-all hover:scale-[1.01]"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-label text-[var(--foreground)] mb-1 truncate">
                              {material.title}
                            </h3>
                            <div className="flex items-center gap-2 text-caption text-[var(--foreground-muted)]">
                              <Calendar className="h-3 w-3" />
                              {new Date(material.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm" className="flex-shrink-0">
                          {material.filename}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 교안 작성 팁 */}
      <Card variant="outlined" className="border-[var(--info)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[var(--info)]" />
            <CardTitle>교안 작성 팁</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-body text-[var(--foreground)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--info)]">•</span>
              <span>명확하고 구조화된 형식으로 작성하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--info)]">•</span>
              <span>주요 개념, 정의, 예시를 포함하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--info)]">•</span>
              <span>학생들이 자주 묻는 질문을 예상하여 작성하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--info)]">•</span>
              <span>코드 예제가 있다면 주석과 함께 작성하세요</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

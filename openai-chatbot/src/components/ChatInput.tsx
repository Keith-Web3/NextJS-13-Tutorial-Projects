'use client'

import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { ComponentPropsWithoutRef, useContext, useRef, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'
import { nanoid } from 'nanoid'
import { Message } from '@/lib/validators/message'
import { MessagesContext } from '@/context/messages'
import { CornerDownLeft, Loader2 } from 'lucide-react'
import { useToast } from './ui/use-toast'

interface ChatInputProps {}

const ChatInput = function ({
  className,
  ...props
}: ChatInputProps & ComponentPropsWithoutRef<'div'>) {
  const [input, setInput] = useState('')
  const { toast } = useToast()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const {
    messages,
    addMessage,
    removeMessage,
    updateMessage,
    setIsMessageUpdating,
  } = useContext(MessagesContext)

  const { mutate: sendMessage, isLoading } = useMutation({
    mutationFn: async function (message: Message) {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [message] }),
      })

      if (!response.ok) throw new Error('error')

      return response.body
    },
    onMutate(message) {
      addMessage(message)
    },
    onSuccess: async stream => {
      if (!stream) throw new Error('No stream found')

      const id = nanoid()
      const responseMessage: Message = {
        id,
        isUserMessage: false,
        text: '',
      }

      addMessage(responseMessage)

      setIsMessageUpdating(true)

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        updateMessage(id, prev => prev + chunkValue)
      }

      setIsMessageUpdating(false)
      setInput('')

      setTimeout(() => {
        textAreaRef.current?.focus()
      }, 10)
    },
    onError(_, message) {
      console.log('works')
      toast({
        title: 'Error',
        description: 'Something went wrong, Please try again.',
        variant: 'destructive',
      })
      removeMessage(message.id)
      textAreaRef.current?.focus()
    },
  })
  return (
    <div {...props} className={cn('border-t border-zinc-300', className)}>
      <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border-none outline-none">
        <ReactTextareaAutosize
          ref={textAreaRef}
          rows={2}
          disabled={isLoading}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()

              const message = {
                id: nanoid(),
                isUserMessage: true,
                text: input,
              }

              sendMessage(message)
            }
          }}
          maxRows={4}
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
          placeholder="write a message..."
          className="peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm leading-6"
        />
        <div className="absolute inset-y-0 right-0 flex py-1 5 pr-1 5">
          <kbd className="inline-flex items-center rounded border bg-white border-gray-200 px-1 font-sans text-xs text-gray-400">
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3 h-3" />
            )}
          </kbd>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600"
        />
      </div>
    </div>
  )
}

export default ChatInput

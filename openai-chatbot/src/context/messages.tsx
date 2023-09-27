import { Message } from '@/lib/validators/message'
import { ReactNode, createContext, useState } from 'react'
import { nanoid } from 'nanoid'

export const MessagesContext = createContext<{
  messages: Message[]
  isMessageUpdating: boolean
  addMessage: (message: Message) => void
  removeMessage: (id: string) => void
  updateMessage: (id: string, updateFn: (prevText: string) => string) => void
  setIsMessageUpdating: (isUpdating: boolean) => void
}>({
  messages: [],
  isMessageUpdating: false,
  addMessage: () => {},
  removeMessage: () => {},
  updateMessage: () => {},
  setIsMessageUpdating: () => {},
})

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nanoid(),
      text: 'Hello, how can I help you?',
      isUserMessage: false,
    },
  ])
  const addMessage = function (message: Message) {
    setMessages(prev => [...prev, message])
  }
  const removeMessage = function (id: string) {
    setMessages(prev => prev.filter(message => message.id !== id))
  }
  const updateMessage = function (
    id: string,
    updateFn: (prevText: string) => string
  ) {
    setMessages(prev =>
      prev.map(message => {
        if (message.id === id) {
          return { ...message, text: updateFn(message.text) }
        }

        return message
      })
    )
  }
  return (
    <MessagesContext.Provider
      value={{
        messages,
        addMessage,
        removeMessage,
        updateMessage,
        isMessageUpdating,
        setIsMessageUpdating,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface GameFAQProps {
  gameName: string
}

export default function GameFAQ({ gameName }: GameFAQProps) {
  // Common FAQs
  const commonFaqs = [
    {
      question: "How does SquadUp work?",
      answer:
        "SquadUp connects you with professional and highly skilled teammates who can help you improve your gameplay while having fun. You can book sessions with pros, play together, and learn from their expertise in real-time.",
    },
    {
      question: "How are the pro teammates vetted?",
      answer:
        "All our pro teammates go through a rigorous verification process that includes rank verification, gameplay analysis, background checks, and communication skills assessment. We only accept the top 5% of applicants to ensure quality.",
    },
    {
      question: "What happens if I'm not satisfied with my session?",
      answer:
        "We offer a satisfaction guarantee. If you're not happy with your session for any reason, you can request a refund or a free session with another pro teammate. Your experience is our top priority.",
    },
    {
      question: "Can I choose the same pro teammate for future sessions?",
      answer:
        "If you enjoyed playing with a particular pro, you can book them directly for future sessions. Many of our users develop ongoing coaching relationships with their favorite pros.",
    },
  ]

  // Game-specific FAQs
  const gameFaqs = {
    Valorant: [
      {
        question: "What ranks are your Valorant pro teammates?",
        answer:
          "Our Valorant pros are primarily Immortal and Radiant ranked players, with a minimum requirement of Diamond 3. Many are current or former professional players with competitive experience.",
      },
      {
        question: "Can I request help with specific agents or roles?",
        answer:
          "Yes! When booking a session, you can specify which agents or roles you want to focus on. We'll match you with pros who specialize in those areas or you can select a pro with expertise in your preferred agent/role.",
      },
      {
        question: "Will the pro use voice chat during our Valorant session?",
        answer:
          "Yes, our pros use voice chat to provide real-time guidance, callouts, and feedback during your games. Clear communication is essential for improvement in Valorant.",
      },
    ],
    "Marvel Rivals": [
      {
        question: "What heroes do your Marvel Rivals pros specialize in?",
        answer:
          "Our Marvel Rivals pros collectively cover all heroes in the game. When booking, you can specify which heroes you want to learn or play with, and we'll match you with a pro who specializes in those characters.",
      },
      {
        question: "Can pros help me understand the current Marvel Rivals meta?",
        answer:
          "Our pros stay up-to-date with the latest patches, hero balance changes, and meta developments. They can help you understand the current state of the game and how to adapt your playstyle accordingly.",
      },
      {
        question: "Do you offer team coaching for Marvel Rivals?",
        answer:
          "Yes, we offer team coaching packages where a pro can work with your entire squad. This is great for friends who play together and want to improve their team coordination and strategies.",
      },
    ],
  }

  // Combine common FAQs with game-specific FAQs
  const faqs = [...commonFaqs, ...(gameFaqs[gameName as keyof typeof gameFaqs] || [])]

  return (
    <section className="py-16 bg-black/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Got questions about playing {gameName} with SquadUp? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-gray-800">
                <AccordionTrigger className="text-left font-medium text-white hover:text-green-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

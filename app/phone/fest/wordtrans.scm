(load (path-append libdir "init.scm"))

(define (pp fw text)
  (set! t (format nil "%s\n" text)) ; ha
  (let ((u (utt.synth (eval (list 'Utterance 'Text t))))) ; ha
    (mapcar (lambda (seg) (rsegs fw seg)) (utt.relation.items u 'SylStructure))
    (format fw "\n")
    t
  )
)

(define (rsegs fw seg)
  (set! n (item.feat seg 'name))
  (set! b (item.feat seg 'segment_start))
  (set! e (item.feat seg 'segment_end))
  (set! t (item.feat seg 'R:SylStructure.tobi_endtone))
  (set! d (item.feat seg 'R:SylStructure.daughtern.daughtern.end))
  (format fw "%f %f %f %s \n" b e d n )
)

(pp (fopen "-" "w") (car argv))

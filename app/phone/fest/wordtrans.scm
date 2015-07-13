(load (path-append libdir "init.scm"))

(define (pp fw text)
  (set! t (format nil "%s\n" text)) ; ha
  (let ((u (utt.synth (eval (list 'Utterance 'Text t))))) ; ha
    (mapcar (lambda (seg) (rwords fw seg)) (utt.relation.items u 'SylStructure))
    (format fw "\n")
    t
  )
)
(define (rwords fw seg)
  (set! n (item.feat seg 'name))
  (set! b (item.feat seg 'segment_start))
  (set! e (item.feat seg 'segment_end))
  (set! t (item.feat seg 'R:SylStructure.tobi_endtone))
  (set! d (item.feat seg 'R:SylStructure.daughtern.daughtern.end))
  (cond
    ((not (eq e 0)) (format fw "" ))
    ((not (eq d 0)) (format fw "%f %s \n" d n ))
    ((string-equal n "syl") (format fw ""))
  )
)

(pp (fopen "-" "w") (car argv))

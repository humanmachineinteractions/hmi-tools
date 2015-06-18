(load (path-append libdir "init.scm"))

(define (pp fw text)
  (set! t (format nil "%s\n" text)) ; scheme sux
  (let ((u (utt.synth (eval (list 'Utterance 'Text t)))))
    (mapcar (lambda (seg) (rr fw seg)) (utt.relation.items u 'SylStructure))
    (format fw "\n")
    t
  )
)

(define (rr fw seg)
  (set! n (item.feat seg 'name))
  (set! e (item.feat seg 'segment_end))
  (set! t (item.feat seg 'R:SylStructure.tobi_endtone))
  (set! d (item.feat seg 'R:SylStructure.daughtern.daughtern.end))
  ;(format fw "%f %f %s %s\n" e d n t)
  (cond
    ((not (eq e 0)) (format fw "%s " n))
    ((not (eq d 0)) (format fw "_ "))
    ((string-equal n "syl") (format fw ""))
  )
)

(pp (fopen "-" "w") (car argv))
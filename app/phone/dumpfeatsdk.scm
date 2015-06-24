(load (path-append libdir "init.scm"))

(set! ll 0)
(set! ln "")

(define (pp fw fn)
  (set! t (format nil "%s\n" fn)) ; scheme sux
  (let ((u (utt.load nil fn)))
    (format fw "# Segments\n" )
    (set! ll 0)
    (mapcar (lambda (seg) (rsegs fw seg)) (utt.relation.items u 'SylStructure))

    (format fw "# Syllable\n" )
    (set! ll 0)
    (mapcar (lambda (seg) (rsyl fw seg)) (utt.relation.items u 'SylStructure))

    (format fw "# IntEvents\n" )
    (set! ll 0)
    (mapcar (lambda (seg) (rinte fw seg)) (utt.relation.items u 'SylStructure))

    (format fw "# Words\n" )
    (set! ll 0)
    (mapcar (lambda (seg) (rwords fw seg)) (utt.relation.items u 'SylStructure))

    (format fw "# Phrase\n" )
    (set! ll 0)
    (mapcar (lambda (seg) (rphrase fw seg)) (utt.relation.items u 'Phrase))

    t
  )
)

(define (rsegs fw seg)
  (set! n (item.feat seg 'name))
  (set! b (item.feat seg 'segment_start))
  (set! e (item.feat seg 'segment_end))
  (set! t (item.feat seg 'R:SylStructure.tobi_endtone))
  (set! d (item.feat seg 'R:SylStructure.daughtern.daughtern.end))
  (cond
    ((not (eq e 0)) (format fw "%f %f %s \n" b e n))
    ((not (eq d 0)) (format fw ""))
    ((string-equal n "syl") (format fw ""))
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

(define (rsyl fw seg)
  (set! n (item.feat seg 'name))
  (set! b (item.feat seg 'segment_start))
  (set! e (item.feat seg 'segment_end))
  (if (not (eq e 0)) (set! ll e))
  (set! a (item.feat seg 'R:SylStructure.accented))
  (set! t (item.feat seg 'R:SylStructure.tobi_endtone))
  (set! d (item.feat seg 'R:SylStructure.daughtern.daughtern.segment_end))
  (cond
    ((not (eq e 0)) (set! ln (string-append ln n ".")))
    ((string-equal n "syl") (format fw "%f %s; stress %s \n" ll ln a ) (set! ln ""))
    ((and (eq e 0) (eq b 0) (eq d 0) (not (string-equal n ","))) (format fw "%f %s; stress %s \n" ll ln a))
  )
)

(define (rinte fw seg)
  (set! n (item.feat seg 'name))
  (set! b (item.feat seg 'segment_start))
  (set! e (item.feat seg 'segment_end))
  (if (not (eq e 0)) (set! ll e))
  (set! a (item.feat seg 'R:SylStructure.accented))
  (set! t (item.feat seg 'R:SylStructure.tobi_endtone))
  (set! d (item.feat seg 'R:SylStructure.daughtern.daughtern.segment_end))
  (cond
    ((not (eq e 0)) (set! ln (string-append ln n ".")))
    ((string-equal n "syl") (format fw "%f %s\n"  ll t ) )
  )
)

(define (rphrase fw seg)
  (set! n (item.feat seg 'name))
  (set! b (item.feat seg 'segment_start))
  (set! e (item.feat seg 'segment_end))
  (set! t (item.feat seg 'R:SylStructure.tobi_endtone))
  (set! d (item.feat seg 'R:SylStructure.daughtern.daughtern.segment_end))
  (if (not (eq d 0)) (set! ll d))
  ;(format fw "%f %s %s\n" ll  n t)
  (if (or (string-equal n "B") (string-equal n "BB")) (format fw "%f %s \n" ll n))
)

(pp (fopen "voicebo/test1.txt" "w") "voiceb/festival/utts_hmm/adapt010.utt")